const NotesService = {
  getAllNotes(knex) {
    return knex.select('*').from('notes')
  },
  addNote(knex, newNote) {
    return knex
      .insert(newNote)
      .into('notes')
      .returning('*')
      .then(notes => {
        return notes[0]
      })
  },
  getById(knex, id) {
    return knex.from('notes').select('*').where('id', id).first()
  },
  deleteNote(knexInstance, id) {
    return knexInstance('notes')
      .where({ id })
      .delete()
  }
}

module.exports = NotesService