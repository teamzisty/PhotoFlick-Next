import { addRequestMeta } from "next/dist/server/request-meta";
import fs from "fs";

const DB_PATH = "./src/app/db/database.json";
const response_content_type = "application/json";
const need_keys = [ // リクエスト時に必要なデータ
    "photo_id"
];

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries);
    console.log(query);

    let need_include = false;

    for (let need_key of need_keys) {
        if (!Object.keys(query).includes(need_key)) {
            need_include = true;
            break;
        }
    }

    if (need_include) {
        return new Response(
            JSON.stringify({
                "success": false,
                "message": "Query needs photo_id"
            }),
            {
                status: 400,
                headers: {
                    "Content-Type": response_content_type
                }
            }
        );
    }

    const database = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    const photo_data = database['photos'][query['photo_id']];

    return new Response(
        JSON.stringify({
            "success": true,
            "photo_id": query['photo_id'],
            "photo_data": photo_data
        }),
        {
            status: 200,
            headers: {
                "Content-Type": response_content_type
            }
        }
    );
}