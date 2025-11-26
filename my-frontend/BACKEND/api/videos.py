from flask import Blueprint, jsonify, request
import requests
import os
import requests
videos_bp = Blueprint('videos', __name__)

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "AIzaSyB_Ranl08UdqJfP3eQdrx3NfO95vxnfNs4")
YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YT_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"

import re 

def parse_iso8601_duration(iso):
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    if not m:
        return ""
    h = int(m.group(1) or 0)
    mi = int(m.group(2) or 0)
    s = int(m.group(3) or 0)
    total = h * 3600 + mi * 60 + s
    mm = total // 60
    ss = total % 60
    return f"{mm:02d}:{ss:02d}" if h == 0 else f"{h}:{mi:02d}:{s:02d}"

@videos_bp.route("/", methods=["GET"])
def api_videos():
    if not YOUTUBE_API_KEY:
        return jsonify({"error": "YOUTUBE_API_KEY chưa được cấu hình."}), 400

    q = request.args.get("q", "").strip()
    max_results = int(request.args.get("max", 8))
    if not q:
        return jsonify({"videos": []})

    try:
        search_params = {
            "part": "snippet",
            "q": f"{q} tutorial",
            "maxResults": max_results,
            "type": "video",
            "videoEmbeddable": "true",
            "key": YOUTUBE_API_KEY,
            "safeSearch": "strict"
        }
        sr = requests.get(YT_SEARCH_URL, params=search_params, timeout=20)
        sr.raise_for_status()
        items = sr.json().get("items", [])
        if not items:
            return jsonify({"videos": []})

        video_ids = ",".join([it["id"]["videoId"] for it in items if it.get("id", {}).get("videoId")])

        v_params = {
            "part": "contentDetails,statistics,snippet",
            "id": video_ids,
            "key": YOUTUBE_API_KEY
        }
        vr = requests.get(YT_VIDEOS_URL, params=v_params, timeout=20)
        vr.raise_for_status()
        vids = []

        for v in vr.json().get("items", []):
            sn = v.get("snippet", {})
            cd = v.get("contentDetails", {})
            st = v.get("statistics", {})
            vids.append({
                "id": v["id"],
                "title": sn.get("title", ""),
                "channel": sn.get("channelTitle", ""),
                "thumb": sn.get("thumbnails", {}).get("medium", {}).get("url", ""),
                "duration": parse_iso8601_duration(cd.get("duration")),
                "url": f"https://www.youtube.com/watch?v={v['id']}",
                "views": int(st.get("viewCount", 0)) if "viewCount" in st else None,
                "publishedAt": sn.get("publishedAt", "")
            })

        vids.sort(key=lambda x: x.get("views", 0), reverse=True)
        return jsonify({"videos": vids})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"❌ Lỗi khi gọi YouTube API: {str(e)}"}), 500
