import {Tag, PikabuComment} from './models';
import PouchDB from "pouchdb-browser";
import {default as pouchDBFind} from "pouchdb-find";
import {default as pouchDBUpsert} from "pouchdb-upsert";
import {default as pouchDBAllDbs} from "pouchdb-all-dbs";
// import {default as pouchDBQuickSearch} from "pouchdb-quick-search";
import * as log from "../misc/log";

PouchDB.plugin(pouchDBFind);
PouchDB.plugin(pouchDBUpsert);
PouchDB.plugin(pouchDBAllDbs);
// PouchDB.plugin(pouchDBQuickSearch);

let tables = {
    tags: new PouchDB("tags"),
    pikabuComments: new PouchDB("pikabu_comments"),
    pikabuCommentTagRelation: new PouchDB("pikabuCommentTagRelation"),
    tagPikabuCommentRelation: new PouchDB("tagPikabuCommentRelation"),
};

function createIndices() {
    /*tables.tags.createIndex({
        index: {
            fields: ["name"],
        }
    });*/
    tables.pikabuComments.createIndex({
        index: {
            fields: ["hasTags"],
        }
    });
}

function init() {
    createIndices();
}

init();


/**
 * creates a new tag with name or does nothing if tag exists
 *
 * @param name - tag's name
 * @returns {Promise<boolean>}
 */
export async function createTagIfNotExists(name) {
    name = name.trim();
    if (name.length === 0) {
        throw new Error("You should not create an empty tag");
    }
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
 * finds all tags with a provided name
 *
 * @param name
 * @returns {Promise<*>}
 */
export async function getTagsByName(name) {
    name = name.trim();
    let resp = await tables.tags.find({
        selector: {
            name: name,
        },
    });

    return rowsToListOfTags(resp.docs);
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
    commentId,
    commentLink,
    storyId,
    authorUsername,
    createdAtDate,
    contentHTML,
    contentText,
    contentImages,
) {
    if (typeof commentId !== "string") {
        commentId = commentId.toString();
    }

    return (await tables.pikabuComments.putIfNotExists(
        (new PikabuComment(
            commentId,
            commentLink,
            storyId,
            authorUsername,
            createdAtDate,
            contentHTML,
            contentText,
            contentImages,
        )).toPouchDbObject(),
    )).updated;
}

/**
 * deletes pikabu comment with provided id and all its comment:tag relations
 *
 * @param id
 * @returns {Promise<void>}
 */
export async function deletePikabuCommentById(id) {
    const tags = await getAllTagsByPikabuCommentId(id);
    // why is this linter so dummy dumb?
    // eslint-disable-next-line
    for (const tag of tags) {
        await removePikabuCommentTagRelation(id, tag.id);
    }

    const doc = await tables.pikabuComments.get(id);
    await tables.pikabuComments.remove(doc);

    return true;
}

/**
 * deletes a tag with provided id and all its comment:tags relations
 *
 * @param id
 * @returns {Promise<void>}
 */
export async function deleteTagById(id) {
    log.debug("deleteTagById(" + id + ");");
    const pikabuComments = await getAllPikabuCommentsByTagId(id);
    // eslint-disable-next-line
    log.debug("removing relations");
    for (const pikabuComment of pikabuComments) {
        await removePikabuCommentTagRelation(pikabuComment.id, id);
    }

    log.debug("deleting tag itself");
    const doc = await tables.tags.get(id);
    await tables.tags.remove(doc);

    return true;
}

function rowsToListOfTags(rows) {
    return rows.map(row => {
        if (row.hasOwnProperty("doc")) {
            return row.doc;
        }
        return row;
    }).filter(row => row !== null && !row._id.startsWith("_")).map(row => {
        let tag = new Tag();
        Object.assign(tag, row);
        tag.id = tag._id;
        return tag;
    });
}

async function getTags(options) {
    let res = await tables.tags.allDocs(options);

    return rowsToListOfTags(res.rows);
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

// TODO: write a doc
export async function getPikabuComments(fieldToOrder, reversedOrdering, onlyWithoutTags, includeTags, limit, skip) {
    // let res = await tables.pikabuComments.allDocs(options);
    //
    // res = res.rows.filter(row => !row.doc._id.startsWith("_"));
    // res = res.map(async row => {
    //     let pikabuComment = PikabuComment.fromPouchDbObject(row.doc);
    //     if (includeTags) {
    //         pikabuComment.tags = await getAllTagsByPikabuCommentId(pikabuComment.id);
    //     }
    //     return pikabuComment;
    // });
    //
    // return await Promise.all(res);
    /*if (fieldToOrder === "id") {
        fieldToOrder = "_id";
    }*/
    fieldToOrder = "_id";
    let selector = {
        _id: {
            $gt: 0,
        },
    };
    if (onlyWithoutTags) {
        selector["hasTags"] = {
            $ne: "1",
        };
    }
    let res = await tables.pikabuComments.find({
        selector: selector,
        sort: [fieldToOrder],
        limit: limit,
        skip: skip,
    });

    res = res.docs.filter(row => !row._id.startsWith("_"));
    res = res.map(async row => {
        let pikabuComment = PikabuComment.fromPouchDbObject(row);
        if (includeTags) {
            pikabuComment.tags = await getAllTagsByPikabuCommentId(pikabuComment.id);
        }
        return pikabuComment;
    });
    res = await Promise.all(res);

    return res;
}

/**
 * returns all existing pikabu comments
 *
 * @param includeTags whether to include tags for each comment or not
 * @returns {Promise<*[]>}
 */
export async function getAllPikabuComments(includeTags) {
    includeTags = !!includeTags;
    return await getPikabuComments({
        include_docs: true,
        // attachments: true,
    }, includeTags);
}

/**
 * drops database completely
 *
 * @returns {Promise<void>}
 */
export async function dropDatabase() {
    const dbs = await PouchDB.allDbs();
    // eslint-disable-next-line
    for (const dbName of dbs) {
        await (new PouchDB(dbName)).destroy();
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
    if (typeof commentId !== "string") {
        commentId = commentId.toString();
    }

    // to be sure they exist
    await tables.tags.get(tagId);
    await tables.pikabuComments.get(commentId);

    await tables.pikabuCommentTagRelation.putIfNotExists({_id: commentId + ":" + tagId});
    await tables.tagPikabuCommentRelation.putIfNotExists({_id: tagId + ":" + commentId});

    // update field hasTags
    const comment = await tables.pikabuComments.get(commentId);
    comment.hasTags = "1";
    await tables.pikabuComments.put(comment);

    return true;
}

export async function removePikabuCommentTagRelation(commentId, tagId) {
    log.debug("removePikabuCommentTagRelation(", commentId, ", ", tagId, ");");

    // to be sure they exist
    await tables.pikabuComments.get(commentId);
    await tables.tags.get(tagId);

    const commentTags = await getAllTagsByPikabuCommentId(commentId);
    if (commentTags.length === 0) {
        const comment = await tables.pikabuComments.get(commentId);
        comment.hasTags = "0";
        await tables.pikabuComments.put(comment);
    }

    try {
        const doc = await tables.pikabuCommentTagRelation.get(commentId + ":" + tagId);
        await tables.pikabuCommentTagRelation.remove(doc);
    } catch (e) {
        if (!e.hasOwnProperty("status") || e.status !== 404) {
            log.debug("relation '" + commentId + ":" + tagId + "' does not exist");
            throw e;
        }
    }
    try {
        const doc = await tables.tagPikabuCommentRelation.get(tagId + ":" + commentId);
        await tables.tagPikabuCommentRelation.remove(doc);
    } catch (e) {
        if (!e.hasOwnProperty("status") || e.status !== 404) {
            log.debug("relation '" + tagId + ":" + commentId + "' does not exist");
            throw e;
        }
    }

    return true;
}

/**
 * retrieves all tags for the comment with provided id
 *
 * @param commentId
 * @returns {Promise<*>}
 */
export async function getAllTagsByPikabuCommentId(commentId) {
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

export async function searchTagsByName(name) {
    let tags = await getAllTags();

    return tags.filter(tag => tag.name.toLowerCase().includes(name));
}

/**
 * retrieves all pikabu comments for the tag with provided id
 *
 * @param tagId
 * @returns {Promise<*>}
 */
export async function getAllPikabuCommentsByTagId(tagId) {
    // https://pouchdb.com/api.html#prefix-search
    let ids = (await tables.tagPikabuCommentRelation.allDocs({
        startkey: tagId + ":",
        endkey: tagId + ":\ufff0",
    })).rows.map(row => {
        return row.id.split(':')[1];
    });

    return await getPikabuComments({
        include_docs: true,
        keys: ids,
    }, false);
}

/**
 * returns total number of pikabu comments saved in db
 *
 * @returns {Promise<void>}
 */
export async function getNumberOfPikabuComments() {
    const info = await tables.pikabuComments.info();
    log.debug("info1: ", info);
    return info.doc_count;
}

/**
 * returns total number of pikabu comments saved in db which have tags
 *
 * @returns {Promise<void>}
 */
export async function getNumberOfPikabuCommentsWithTags() {
    const info = await tables.pikabuCommentTagRelation.info();
    const numberOfRelations = info.doc_count;
    if (numberOfRelations != (await tables.tagPikabuCommentRelation.info()).doc_count) {
        log.error(`something is broken, call the developer: 
            numberOfRelations != (await tables.tagPikabuCommentRelation.info()).doc_count`);
    }
    return numberOfRelations;
}

/**
 * returns total number of tags saved in db
 *
 * @returns {Promise<void>}
 */
export async function getNumberOfTags() {
    const info = await tables.tags.info();
    log.debug("info3: ", info);
    return info.doc_count;
}
