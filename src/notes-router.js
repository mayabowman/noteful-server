const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const bodyParser = express.json()

const sanitizeNote = note => ({
  id: note.id.toString(),
  name: xss(note.note_name),
  content: xss(note.content),
  folderId: note.folder_id.toString(),
  modified: note.modified
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    
    NotesService.getAllNotes(knexInstance)
      .then(notes => {
        let newNotes = notes.map(note => {
          return sanitizeNote
        })
        return newNotes
      })
      .then(newNotes => {
        res.json(newNotes)
      })
      .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    const { name, folderId, content, modified } = req.body
    const newNote = {note_name: name, folder_id: folderId, content, modified }
    const knexInstance = req.app.get('db')

    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }
    NotesService.addNote(knexInstance, newNote)
      .then(note => {
        res
          .status(201)
          .location(`http://localhost:8000/note/${note.id}`)
          .json(sanitizeNote)
      })
      .catch(next)
  })

notesRouter
  .route('/:id')
  .get((req, res, next) => {
    const { id } = req.params
    const knexInstance = req.app.get('db')

    NotesService.getById(knexInstance, id)
      .then(note => {
        if (!note) {
          res.status(400).send('This note does not exist')
        }
        res.json(sanitizeNote)
      })
      .catch(next)
  })
  .delete(bodyParser, (req, res) => {
    const { id } = req.params
    const knexInstance = req.app.get('db')

    NotesService.deleteNote(knexInstance, id)
      .then(note => {
        res.status(204).send('Note deleted')
      })
  })

module.exports = notesRouter