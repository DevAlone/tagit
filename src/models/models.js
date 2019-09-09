export class Tag {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

export class PikabuComment {
    constructor(id,
                authorUsername,
                createdAtDate,
                contentHTML,
                contentText,
                contentImages) {
        this.id = id;
        this.authorUsername = authorUsername;
        this.createdAtDate = createdAtDate;
        this.contentHTML = contentHTML;
        this.contentText = contentText;
        this.contentImages = contentImages;
    }

    get _id() {
        return this.id;
    }

    set _id(value) {
        this.id = value;
    }
}
