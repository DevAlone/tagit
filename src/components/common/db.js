import {Tag, PikabuComment} from '../../models/models';
import PouchDB from "pouchdb-browser";

let tags = new PouchDB('tags');
let pikabuComments = new PouchDB('pikabu_comments');

/**
 * creates a new tag with name or does nothing if tag exists
 *
 * @param name - tag's name
 * @returns {Promise<void>}
 */
export async function createTagIfNotExists(name) {
}

/**
 * creates new pikabu comment with id or does nothing if comment with a provided id exists
 *
 * @param id
 * @param authorUsername
 * @param createdAtDate
 * @param contentHTML
 * @param contentText
 * @param contentImages
 * @returns {Promise<void>}
 */
export async function createPikabuCommentIfNotExists(
    id,
    authorUsername,
    createdAtDate,
    contentHTML,
    contentText,
    contentImages) {
    try {
        let comment = await pikabuComments.get(id);
        console.log("got comment");
        console.log(comment);
        // exists so exit
        return;
    } catch (err) {
        if (err.hasOwnProperty("status")) {
            if (err.status === 404) {
                // create
                await pikabuComments.put({
                    _id: id,
                    authorUsername: authorUsername,
                    createdAtDate: createdAtDate,
                    contentHTML: contentHTML,
                    contentText: contentText,
                    contentImages: contentImages,
                });
                console.log("created a comment");

                return;
            }
        }
        throw err;
    }
}

/**
 * returns all existing tags
 *
 * @returns {Promise<*[]>}
 */
export async function getAllTags() {
    return [
        new Tag(1, "none"),
        new Tag(2, "fun"),
        new Tag(2, "science"),
        new Tag(2, "politics"),
    ]
}

/**
 * returns all existing pikabu comments
 *
 * @returns {Promise<*[]>}
 */
export async function getAllPikabuComments() {
    let res = await pikabuComments.allDocs({
        include_docs: true,
        // attachments: true,
    });
    return res.rows.map(row => {
        let pikabuComment = new PikabuComment();
        Object.assign(pikabuComment, row.doc);
        pikabuComment.id = pikabuComment._id;
        return pikabuComment;
    });
}
