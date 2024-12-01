import { randomUUID } from "crypto";
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
        const body = await req.text();
        let params = {};

        try {
            const temp = new URLSearchParams(body);
            params = Object.fromEntries(temp.entries());
        } catch (e) {
            console.error(e);
            return new Response(
                JSON.stringify({
                    "success": false,
                    "message": "Parameter needs user_id and user_pass."
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': response_content_type
                    }
                }
            );
        }

        const keys = Object.keys(params);
        let need_include = false;

        for (let need_key of need_keys) {
            if (!keys.includes(need_key)) {
                need_include = true;
            }
        }

        if (need_include) {
            return new Response(
                JSON.stringify({
                    "success": false,
                    "message": "Parameter needs user_id and user_pass."
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': response_content_type
                    }
                }
            );
        }

        const database = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        const users_data = database['user'];
        const user_ids = Object.keys(users_data);
        const { user_id, user_pass } = params;

        if (user_ids.includes(user_id)) { // ユーザーが存在するなら
            const user_data = users_data[user_id];

            if (user_data['user_pass'] == user_pass) { // パスワードがあっているなら
                const session_uuid = randomUUID();
                return new Response(
                    JSON.stringify({
                        "session_id": session_uuid
                    }),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': response_content_type
                        }
                    }
                )
            }
        }
    } else {
        return new Response(
            JSON.stringify({
                "success": false,
                "message": "Allow Content-Type is " + allow_content_type
            }),
            {
                status: 400,
                headers: {
                    "Content-Type": response_content_type
                }
            }
        );
    }
}