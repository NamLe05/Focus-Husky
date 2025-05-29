/**
 * Database service
 */

const Datastore = require('@seald-io/nedb');

export default class TypedDatastore<T> {
  private db;

  /**
   * Construct a new typed data store
   * @param filePath path to the database file with .db extension
   * @param pk Primary key of the database (usually id)
   */
  constructor(filePath: string) {
    this.db = new Datastore({
      filename: filePath,
      timestampData: true,
      autoload: true,
    });
  }

  /**
   * Inserts a new document into the typed database
   * @param document A valid document of type <T>
   */
  async insertDoc(document: T): Promise<void> {
    await this.db.insertAsync(document);
  }

  /**
   * Finds matching documents from the typed database
   * @param query A query using a subset of document
   * @param callback A required function that handles error and found docs
   * @returns
   */
  async findDoc(query: Partial<T>): Promise<void> {
    return await this.db.findAsync(query);
  }

  /**
   * Update a document in the typed database
   * @param oldDoc Existing document within database.
   * @param newDoc New document to be updated.
   * @param callback An optional function that handles error and updated doc
   */
  async updateDoc(
    oldDoc: Partial<T & {_id: string}>,
    newDoc: Partial<T> | {$set: Partial<T>},
  ): Promise<void> {
    await this.db.updateAsync(oldDoc, newDoc);
  }

  /**
   * Removes a document from the typed database
   * @param query A subset of the document to be removed (usually by id)
   * @param multi If you want to remove multiple documents (avoid unless absolutely necessary)
   */
  async removeDoc(query: Partial<T>, multi = false): Promise<void> {
    this.db.removeAsync(query, {multi});
  }
}
