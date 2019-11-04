require('dotenv').config()
const knex = require('knex')
const FoldersService = require('../src/folders-service')

describe('Folder service object', function() {
  let db 

  let testFolders = [
    {
      folder_name: 'Important',
      id: 1
    },
    {
      folder_name: 'Super',
      id: 2
    },
    {
      folder_name: 'Spangley',
      id: 3
    }
  ]

  let newFolder = { id: 4, folder_name: 'Awesome' }

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
    return db.raw('TRUNCATE folders RESTART IDENTITY CASCADE')
  })

  beforeEach('Insert test data into folder table', () => {
    return db.into('folders').insert(testFolders)
  })

  describe('getAllFolders', () => {
    it('it returns all folders from folders table', () => {
      return FoldersService.getAllFolders(db)
        .then(folders => {
          expect(folders).to.have.deep.members(testFolders)
        })
    })
  })

  describe('addFolder', () => {
    it('it should add a folder to the folder table', () => {
      return FoldersService.addFolder(db, newFolder)
        .then(folder => {
          expect(folder).to.eql(newFolder)
        })
    })
  })
})