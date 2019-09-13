import {Tag, PikabuComment} from './models';
import PouchDB from "pouchdb-browser";
import {default as pouchDBFind} from "pouchdb-find";

PouchDB.plugin(pouchDBFind);

let tables = {
    tags: new PouchDB("tags"),
    pikabuComments: new PouchDB("pikabu_comments"),
    pikabuCommentTagRelation: new PouchDB("pikabuCommentTagRelation"),
    tagPikabuCommentRelation: new PouchDB("tagPikabuCommentRelation"),
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


async function getTags(options) {
    let res = await tables.tags.allDocs(options);

    return res.rows.filter(row => !row.doc._id.startsWith("_")).map(row => {
        let tag = new Tag();
        Object.assign(tag, row.doc);
        tag.id = tag._id;
        return tag;
    })
}

/**
 * returns all existing tags
 *
 * @returns {Promise<*[]>}
 */
export async function getAllTags() {
    return await getTags({
        include_docs: true,
    });
}

/**
 * returns all existing pikabu comments
 *
 * @param includeTags whether to include tags for each comment or not
 * @returns {Promise<*[]>}
 */
export async function getAllPikabuComments(includeTags) {
    includeTags = !!includeTags;

    let res = await tables.pikabuComments.allDocs({
        include_docs: true,
        // attachments: true,
    });

    res = res.rows.filter(row => !row.doc._id.startsWith("_"));
    res = res.map(async row => {
        let pikabuComment = new PikabuComment();
        Object.assign(pikabuComment, row.doc);
        pikabuComment.id = pikabuComment._id;
        if (includeTags) {
            pikabuComment.tags = await getAllTagsByCommentId(pikabuComment.id);
        }
        return pikabuComment;
    });

    return await Promise.all(res);
}

/**
 * drops database completely
 *
 * @returns {Promise<void>}
 */
export async function dropDatabase() {
    for (let table of Object.keys(tables)) {
        await table.destroy();
    }
}

/**
 * tags a comment
 *
 * @param commentId
 * @param tagId
 * @returns {Promise<boolean>} true if relation was created, false if already existed
 */
export async function makePikabuCommentTagRelationIfNotExists(commentId, tagId) {
    // to be sure they exist
    await tables.pikabuComments.get(commentId);
    await tables.tags.get(tagId);

    try {
        await tables.pikabuCommentTagRelation.get(commentId + ":" + tagId);
        // exists so exit
        return false;
    } catch (err) {
        if (!err.hasOwnProperty("status") || err.status !== 404) {
            throw err;
        }
    }

    await tables.pikabuCommentTagRelation.put({_id: commentId + ":" + tagId});
    await tables.tagPikabuCommentRelation.put({_id: tagId + ":" + commentId});

    return true;
}


export async function getAllTagsByCommentId(commentId) {
    // https://pouchdb.com/api.html#prefix-search
    let ids = (await tables.pikabuCommentTagRelation.allDocs({
        startkey: commentId + ":",
        endkey: commentId + ":\ufff0",
    })).rows.map(row => {
        return row.id.split(':')[1];
    });

    return await getTags({
        include_docs: true,
        keys: ids,
    });
}