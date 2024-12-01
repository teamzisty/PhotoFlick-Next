import fs, { readFileSync } from "fs";
import { readFile } from "fs/promises";
import Head from "next/head";

const DB_PATH = "./src/app/db/database.json";
const allow_content_type = "x-www-form-urlencoded";
const need_keys = [
    "user_id",
    "user_name",
    "user_mail",
    "user_pass"
];

export async function POST(req) {
    const content_type = req.headers.get('content-type');
    console.log('Content-Type: ' + content_type);

    if (content_type == allow_content_type) { // APIのContent-Typeを制限
        const body = await req.text();
        let params;
        try {
            params = new URLSearchParams(body);
        } catch (e) {
            return new Response(
                JSON.stringify({
                    "sccess": false,
                    "message": "Parameter needs user_id and user_name and user_pass and user_mail."
                })
            );
        }

        const keys = Object.keys(params);
        const need_include = false;

        for (let need_key of need_keys) {
            if (!keys.includes(need_key)) {
                need_include = true;
            }
        }

        if (need_include) { // 必要なパラメータがどれか足りなかったら
            return new Response(
                JSON.stringify({
                    "sccess": false,
                    "message": "Parameter needs user_id and user_name and user_pass and user_mail."
                }),
                {
                    "status": 400,
                    "headers": {
                        "Content-Type": "application/json"
                    }
                }
            );
        }
        
        
        return new Response(
            JSON.stringify(params),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
    } else {
        return new Response(
            JSON.stringify({
                "sccess": false,
                "message": "Allow Content-Type is " + allow_content_type
            })
        );
    }
}