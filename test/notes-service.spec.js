require('dotenv').config()
const knex = require('knex')
const NotesService = require('../src/notes-service')

describe('Notes service object', function() {
  let db 

  let testNotes = [
    {
      content: 'Test note',
      note_name: 'Test name',
      id: 1,
      folder_id: 1
    },
    {
      content: 'Another test note',
      note_name: 'Another test name',
      id: 2,
      folder_id: 1
    },
    {
      content: 'Last test note',
      note_name: 'Last test name',
      id: 3,
      folder_id: 1
    }
  ]

  let newNote = [{ note_name: 'New note', content: 'New content', id: 4, folder_id: 2, modified: new Date() }]

  before('Get database instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
  })

  after('Close database', () => {
    db.destroy()
  })

  beforeEach('Reset the test database', () => {
    return db('notes').truncate()
  })

  beforeEach('Insert test data into notes table', () => {
    return db.into('notes').insert(testNotes)
  })

  describe('getAllNotes', () => {
    it('it returns all notes from notes table', () => {
      return NotesService.getAllNotes(db)
        .then(notes => {
          expect(notes).to.eql(testNotes)
        })
    })
  })

  describe('addNote', () => {
    it('it should add a note to the note table', () => {
      return NotesService.addNote(db, newNote)
        .then(note => {
          expect(note).to.have.deep.members(newNote)
        })
    })
  })
})