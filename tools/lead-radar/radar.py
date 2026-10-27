"""Keystone lead radar: finds people asking for a 3PL / prep center and emails a daily digest.

Sources (public feeds only, no scraping of logged-in sites):
  - Reddit subreddit RSS feeds (new posts)
  - Hacker News via the Algolia API
  - Any extra RSS feeds in config.json (e.g. Google Alerts RSS)

Run:  python radar.py            -> prints digest
      python radar.py --email    -> also emails it (needs SMTP_* env vars)
"""
import json, os, re, sys, smtplib, time, html
import urllib.request, urllib.parse
import xml.etree.ElementTree as ET
from email.mime.text import MIMEText
from pathlib import Path

HERE = Path(__file__).parent
CFG = json.loads((HERE / "config.json").read_text())
SEEN_FILE = HERE / "seen.json"
UA = "keystone-lead-radar/1.0 (contact: hello@keystoneprepcenter.com)"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()


def parse_feed(raw, source):
    items, root = [], ET.fromstring(raw)
    atom = "{http://www.w3.org/2005/Atom}"
    for e in root.iter(f"{atom}entry"):  # Atom (Reddit, Google Alerts)
        link = e.find(f"{atom}link")
        items.append({
            "id": (e.findtext(f"{atom}id") or "").strip(),
            "title": html.unescape(e.findtext(f"{atom}title") or ""),
            "text": html.unescape(re.sub("<[^>]+>", " ", e.findtext(f"{atom}content") or "")),
            "url": link.get("href") if link is not None else "",
            "source": source,
        })
    for e in root.iter("item"):  # RSS 2.0
        items.append({
            "id": (e.findtext("guid") or e.findtext("link") or "").strip(),
            "title": html.unescape(e.findtext("title") or ""),
            "text": html.unescape(re.sub("<[^>]+>", " ", e.findtext("description") or "")),
            "url": (e.findtext("link") or "").strip(),
            "source": source,
        })
    return items


def reddit_items():
    out = []
    for sub in CFG["subreddits"]:
        try:
            out += parse_feed(fetch(f"https://www.reddit.com/r/{sub}/new/.rss?limit=50"), f"r/{sub}")
        except Exception as ex:
            print(f"[warn] r/{sub}: {ex}", file=sys.stderr)
        time.sleep(2)  # be polite to Reddit
    return out


def hn_items():
    out, since = [], int(time.time()) - 2 * 86400
    for q in CFG["hn_queries"]:
        url = "https://hn.algolia.com/api/v1/search_by_date?" + urllib.parse.urlencode(
            {"query": q, "numericFilters": f"created_at_i>{since}"})
        try:
            for h in json.loads(fetch(url))["hits"]:
                out.append({
                    "id": "hn-" + h["objectID"],
                    "title": h.get("title") or h.get("story_title") or "",
                    "text": re.sub("<[^>]+>", " ", h.get("comment_text") or h.get("story_text") or ""),
                    "url": f"https://news.ycombinator.com/item?id={h['objectID']}",
                    "source": "Hacker News",
                })
        except Exception as ex:
            print(f"[warn] HN '{q}': {ex}", file=sys.stderr)
    return out


def extra_feed_items():
    out = []
    for name, url in CFG.get("extra_feeds", {}).items():
        try:
            out += parse_feed(fetch(url), name)
        except Exception as ex:
            print(f"[warn] {name}: {ex}", file=sys.stderr)
    return out


def score(item):
    t = " " + (item["title"] + " " + item["text"]).lower() + " "
    # Gate: must be about outsourcing fulfillment AND show buyer intent.
    # Generic "looking for" / "recommendations" alone no longer qualifies.
    topic = [w for w in CFG.get("topic", []) if w in t]
    intent = [w for w in CFG.get("intent", []) if w in t]
    if not topic or not intent:
        return 0, []
    s, hits = 0, []
    # Volume mentioned (e.g. "200 orders a day", "1,500 orders/month") is the best sign of a real buyer.
    if re.search(r"\b\d[\d,]*\+?\s*(orders|packages|shipments|units|pallets)\b", t):
        s += 3; hits.append("volume")
    for phrase, pts in CFG["signals"].items():
        if phrase in t:
            s += pts; hits.append(phrase)
    for phrase in CFG["negative"]:
        if phrase in t:
            s -= 5; hits.append("-" + phrase)
    return s, hits


def main():
    seen = set(json.loads(SEEN_FILE.read_text())) if SEEN_FILE.exists() else set()
    items = reddit_items() + hn_items() + extra_feed_items()
    leads = []
    for it in items:
        if not it["id"] or it["id"] in seen:
            continue
        seen.add(it["id"])
        s, hits = score(it)
        if s >= CFG["min_score"]:
            leads.append((s, hits, it))
    leads.sort(key=lambda x: -x[0])
    SEEN_FILE.write_text(json.dumps(sorted(seen)[-5000:]))

    if not leads:
        body = "No new 3PL/prep requests found today."
    else:
        lines = [f"{len(leads)} possible leads (highest score first). Reply within a few hours.\n"]
        for s, hits, it in leads:
            lines.append(f"[{s}] {it['source']}: {it['title'].strip()}\n{it['url']}\n"
                         f"   matched: {', '.join(hits)}\n   {it['text'].strip()[:280]}\n")
        body = "\n".join(lines)
    print(body)

    if "--email" in sys.argv and leads:
        msg = MIMEText(body)
        msg["Subject"] = f"Lead radar: {len(leads)} possible 3PL leads"
        msg["From"] = os.environ["SMTP_USER"]
        msg["To"] = os.environ.get("DIGEST_TO", os.environ["SMTP_USER"])
        with smtplib.SMTP_SSL(os.environ.get("SMTP_HOST", "smtp.gmail.com"), 465) as smtp:
            smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"])
            smtp.send_message(msg)


if __name__ == "__main__":
    main()
