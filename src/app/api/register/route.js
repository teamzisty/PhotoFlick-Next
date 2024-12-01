import fs, { readFileSync } from "fs";
import { readFile } from "fs/promises";

const DB_PATH = "./src/app/db/database.json";
const allow_content_type = "application/x-www-form-urlencoded";
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
        console.log(body);
        let params = {};
        try {
            const temp = new URLSearchParams(body); // ちゃんとデータが読み取れる方式か
            params = Object.fromEntries(temp.entries());
        } catch (e) {
            console.log({
                "sccess": false,
                "message": "Parameter needs user_id and user_name and user_pass and user_mail."
            });
            return new Response(
                JSON.stringify({
                    "sccess": false,
                    "message": "Parameter needs user_id and user_name and user_pass and user_mail."
                })
            );
        }

        console.log(params);

        const keys = Object.keys(params);
        let need_include = false;

        console.log(JSON.stringify(keys));

        for (let need_key of need_keys) {
            if (!keys.includes(need_key)) {
                need_include = true;
            }
        }

        if (need_include) { // 必要なパラメータがどれか足りなかったら
            console.log({
                "sccess": false,
                "message": "Parameter needs user_id and user_name and user_pass and user_mail."
            });
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

        const { user_id, user_name, user_mail, user_pass } = params;
        console.log(`User_id: ${user_id}\nUser_name: ${user_name}\nUser_mail: ${user_mail}\nUser_pass: ${user_pass}`);

        let database = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        const users_data = database['user'];
        const user_ids = Object.keys(users_data);

        if (user_ids.includes(user_id)) {
            console.log({
                "sccess": false,
                "message": "The user id used."
            });
            return new Response(JSON.parse({
                "sccess": false,
                "message": "The user id used."
            }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        let userObj = {
            "user_id":   user_id,
            "user_name": user_name,
            "user_mail": user_mail,
            "user_pass": user_pass,
            "user_photos": []
        };

        database['user'][user_id] = userObj;

        fs.writeFileSync(DB_PATH, JSON.stringify(database));

        delete userObj['user_pass'];
        
        return new Response(
            JSON.stringify(userObj),
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