import fs, { readFileSync } from "fs";

const DB_PATH = "./src/app/db/database.json";
const allow_content_type = "application/x-www-form-urlencoded";
const response_content_type = "application/json";
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
        let params = {};
        try {
            const temp = new URLSearchParams(body); // ちゃんとデータが読み取れる方式か
            params = Object.fromEntries(temp.entries());
        } catch (e) {
            console.log({
                "success": false,
                "message": "Parameter needs user_id and user_name and user_pass and user_mail."
            });
            return new Response(
                JSON.stringify({
                    "success": false,
                    "message": "Parameter needs user_id and user_name and user_pass and user_mail."
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": response_content_type
                    }
                }
            );
        }

        console.log(params);

        const keys = Object.keys(params);
        let need_include = false;

        console.log(JSON.stringify(keys));

        for (let need_key of need_keys) {
            if (!keys.includes(need_key)) {
                need_include = true;
                break;
            }
        }

        if (need_include) { // 必要なパラメータがどれか足りなかったら
            console.log({
                "success": false,
                "message": "Parameter needs user_id and user_name and user_pass and user_mail."
            });
            return new Response(
                JSON.stringify({
                    "success": false,
                    "message": "Parameter needs user_id and user_name and user_pass and user_mail."
                }),
                {
                    "status": 400,
                    "headers": {
                        "Content-Type": response_content_type
                    }
                }
            );
        }

        const { user_id, user_name, user_mail, user_pass } = params;
        console.log(`User_id:   ${user_id}\nUser_name: ${user_name}\nUser_mail: ${user_mail}\nUser_pass: ${user_pass}`);

        let database = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        const users_data = database['user'];
        const user_ids = Object.keys(users_data);

        if (user_ids.includes(user_id)) {
            console.log({
                "success": false,
                "message": "The user id used."
            });
            return new Response(
                JSON.parse({
                    "success": false,
                    "message": "The user id used."
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': response_content_type
                    }
                });
        }

        let userObj = {
            "user_id": user_id,
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
                    "Content-Type": response_content_type
                }
            }
        )
    } else {
        return new Response(
            JSON.stringify({
                "success": false,
                "message": "Allow Content-Type is " + allow_content_type
            }),
            {
                status: 400,
                headers: {
                    'Content-Type': response_content_type
                }
            }
        );
    }
}