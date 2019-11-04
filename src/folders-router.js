const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const bodyParser = express.json()

const sanitizeFolder = folder => ({
  id: folder.id,
  name: xss(folder.folder_name)
})


foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    FoldersService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders.map(sanitizeFolder))
      })
      .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    const { name } = req.body
    if (!name) {
      return res.status(400).send('Folder name is required')
    }

    const knexInstance = req.app.get('db')
    FoldersService.addFolder(knexInstance, { folder_name: name })
      .then(folder => {
        res
          .status(201)
          .location(`http://localhost:8000/api/folders/${folder.id}`)
          .json(sanitizeFolder)
      })
      .catch(next)
  })

foldersRouter
  .route('/:id')
  .get((req, res, next) => {
    const { id } = req.params
    const knexInstance = req.app.get('db')
    FoldersService.getById(knexInstance, id)
      .then(folder => {
        if (!folder) {
          res.status(400).send('This folder does not exist')
        }
        res.json(sanitizeFolder)
      }) 
      .catch(next)
  })

module.exports = foldersRouter