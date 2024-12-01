import fs from "fs";

// 設定
const DB_PATH = "./src/app/db/database.json";
const allow_content_type = "application/x-www-form-urlencoded";
const response_content_type = "application/json";
const need_keys = [ // リクエスト時に必要なデータ
    "user_id",
    "user_pass"
];

export async function POST(req) {
    const content_type = req.headers.get('content-type');

    if (content_type == allow_content_type) {

    } else {
        return new Response(JSON.stringify({
            "success": false,
            "message": "Allow Content-Type is " + allow_content_type
        }),
        {
            status: 400,
            headers: {
                "Content-Type": ""
            }
        });
    }
}