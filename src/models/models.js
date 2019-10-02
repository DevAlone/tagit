export class Tag {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

export class PikabuComment {
    constructor(id,
                commentLink,
                storyId,
                authorUsername,
                createdAtDate,
                contentHTML,
                contentText,
                contentImages) {
        this.id = id;
        this.commentLink = commentLink;
        this.storyId = storyId;
        this.authorUsername = authorUsername;
        this.createdAtDate = createdAtDate;
        this.contentHTML = contentHTML;
        this.contentText = contentText;
        this.contentImages = contentImages;
        this.tags = [];
    }

    get _id() {
        return this.id;
    }

    set _id(value) {
        this.id = value;
    }

    toPouchDbObject() {
        return {
            _id: this.id,
            commentLink: this.commentLink,
            storyId: this.storyId,
            authorUsername: this.authorUsername,
            createdAtDate: this.createdAtDate,
            contentHTML: this.contentHTML,
            contentText: this.contentText,
            contentImages: this.contentImages,
        };
    }

    static fromPouchDbObject(obj) {
        let pikabuComment = new PikabuComment();
        Object.assign(pikabuComment, obj);
        pikabuComment.id = pikabuComment._id;
        return pikabuComment;
    }
}
