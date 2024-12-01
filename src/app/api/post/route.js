import { randomUUID } from "crypto";
import fs from "fs";

// 設定
const DB_PATH = "./src/app/db/database.json";
const SESSION_PATH = "./src/app/db/session.json";
const allow_content_type = "application/x-www-form-urlencoded";
const response_content_type = "application/json";
const need_keys = [ // リクエスト時に必要なデータ
    "session_id",
    "title",
    "description",
    "img_file"
];

export async function POST(req) {
    const content_type = req.headers.get('content-type');
    
    if (content_type != allow_content_type) { // Content-Typeが許可されていなかったら
        return new Response(
            JSON.stringify({
                "success": false,
                "message": "Allow Content-Type is" + allow_content_type
            }),
            {
                status: 400,
                headers: {
                    "Content-Type": response_content_type
                }
            }
        );
    }

    let params = {};

    try {
        const body = await req.text();
        const temp = new URLSearchParams(body);
        params = Object.fromEntries(temp.entries);
    } catch (e) {
        console.error(e);
        return new Response(
            JSON.stringify({
                "success": false,
                "message": e
            }),
            {
                status: 400,
                headers: {
                    "Content-Type": response_content_type
                }
            }
        );
    }

    const keys = Object.keys(params);
    let need_include = false;

    for (let need_key of need_keys) {
        if (!keys.includes(need_key)) {
            need_include = true;
            break;
        }
    }

    if (need_include) {
        return new Response(
            JSON.stringify({
                "success": false,
                "message": "Parameter needs session_id and title and description and img_file."
            }),
            {
                status: 400,
                headers: {
                    "Content-Type": response_content_type
                }
            }
        );
    }

    const { session_id, title, description, img_file } = params;

    // セッションの確認
    let session_data = JSON.stringify(fs.readFileSync(SESSION_PATH, 'utf-8'));
    const session_ids = Object.keys(session_data);

    if (!session_ids.includes(session_id)) { // ログインしていなかったら
        return new Response(
            JSON.stringify({
                "success": false,
                "message": "Please login"
            }),
            {
                status: 403,
                headers: {
                    "Content-Type": response_content_type
                }
            }
        );
    }

    let database = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    let users_data = database['user'];
    const user_ids = Object.keys(users_data);
    const user_id = session_data[session_id];
    
    if (!user_ids.includes(user_id)) { // セッションは存在するがユーザーが存在しなかったら
        delete session_data[session_id];
        fs.writeFileSync(SESSION_PATH, JSON.stringify(session_data));

        return new Response(
            JSON.stringify({
                "success": false,
                "message": "user not found"
            }),
            {
                status: 400,
                headers: {
                    "Content-Type": response_content_type
                }
            }
        );
    }

    const photo_id = randomUUID();
    const photoObj = {
        'photo_id': photo_id,
        'title': title,
        'description': description,
        'author_id': user_id
    }

    users_data[user_id]['user_photos'].push(photo_id);
    database['user'] = users_data;
    database['photos'][photo_id] = photoObj;

    fs.writeFileSync('./public/img/' + photo_id + '.png', img_file['tempfile']);

    fs.writeFileSync(DB_PATH, JSON.stringify(database));

    return new Response(
        JSON.stringify({
            "success": true,
            "photo_id": photo_id,
            "photo_obj": photoObj
        }),
        {
            status: 200,
            headers: {
                "Content-Type": response_content_type
            }
        }
    )
}