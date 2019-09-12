import {Tag, PikabuComment} from './models';
import PouchDB from "pouchdb-browser";
import {default as pouchDBFind} from "pouchdb-find";

PouchDB.plugin(pouchDBFind);

let tables = {
    tags: new PouchDB("tags"),
    pikabuComments: new PouchDB("pikabu_comments"),
};

function createIndices() {
    tables.tags.createIndex({
        index: {
            fields: ["name"],
        }
    });
}

createIndices();

/**
 * creates a new tag with name or does nothing if tag exists
 *
 * @param name - tag's name
 * @returns {Promise<boolean>}
 */
export async function createTagIfNotExists(name) {
    let tags = await tables.tags.find({
        selector: {
            name: name,
        },
    });

    if (tags.docs.length === 0) {
        // doesn't exist
        await tables.tags.post({
            name: name,
        });
        return true;
    }

    // exists so exit
    return false;
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
 * @returns {Promise<boolean>} true if was saved to db, false if already existed
 */
export async function createPikabuCommentIfNotExists(
    id,
    authorUsername,
    createdAtDate,
    contentHTML,
    contentText,
    contentImages) {
    try {
        await tables.pikabuComments.get(id);
        // exists so exit
        return false;
    } catch (err) {
        if (err.hasOwnProperty("status")) {
            if (err.status === 404) {
                // create
                await tables.pikabuComments.put({
                    _id: id,
                    authorUsername: authorUsername,
                    createdAtDate: createdAtDate,
                    contentHTML: contentHTML,
                    contentText: contentText,
                    contentImages: contentImages,
                });

                return true;
            }
        }
        throw err;
    }
}

/**
 * deletes pikabu comment with a provided id
 *
 * @param id
 * @returns {Promise<void>}
 */
export async function deletePikabuCommentById(id) {
    const doc = await tables.pikabuComments.get(id);
    await tables.pikabuComments.remove(doc);
}

/**
 * deletes tag with a provided id
 *
 * @param id
 * @returns {Promise<void>}
 */
export async function deleteTagById(id) {
    const doc = await tables.tags.get(id);
    await tables.tags.remove(doc);
}

/**
 * returns all existing tags
 *
 * @returns {Promise<*[]>}
 */
export async function getAllTags() {
    let res = await tables.tags.allDocs({
        include_docs: true,
    });

    return res.rows.filter(row => !row.doc._id.startsWith("_")).map(row => {
        let tag = new Tag();
        Object.assign(tag, row.doc);
        tag.id = tag._id;
        return tag;
    })
}

/**
 * returns all existing pikabu comments
 *
 * @returns {Promise<*[]>}
 */
export async function getAllPikabuComments() {
    let res = await tables.pikabuComments.allDocs({
        include_docs: true,
        // attachments: true,
    });
    return res.rows.filter(row => !row.doc._id.startsWith("_")).map(row => {
        let pikabuComment = new PikabuComment();
        Object.assign(pikabuComment, row.doc);
        pikabuComment.id = pikabuComment._id;
        return pikabuComment;
    });
}

/**
 * drops database completely
 *
 * @returns {Promise<void>}
 */
export async function dropDatabase() {
    for (let table of Object.keys(tables)) {
        console.log(table);
        await table.destroy();
    }
}
