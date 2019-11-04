const express = require('express')
const xss = require('xss')
const path = require('path')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const bodyParser = express.json()
const knexInstance = req.app.get('db')

const sanitizeFolder = folder => ({
  id: folder.id,
  name: xss(folder.folder_name)
})


foldersRouter
  .route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders.map(sanitizeFolder))
      })
      .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    const { name } = req.body
    const newFolder = { name }
    if (!name) {
      return res.status(400).send('Folder name is required')
    }

    FoldersService.addFolder(knexInstance, newFolder)
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(sanitizeFolder(folder))
      })
      .catch(next)
  })

foldersRouter
  .route('/:id')
  .all((req, res, next) => {
    FoldersService.getById(knexInstance, req.params.id)
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: 'Folder does not exist'}
          })
        }
        res.folder = folder
        next()
      })
  })
  .get((req, res, next) => {
    res.json(sanitizeFolder(res.folder))
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(knexInstance, req.params.id)
      .then(() => {
        res.status(204).end()
      })
      .catch
  })
  .patch(bodyParser, (req, res, next) => {
    const { name } = req.body
    const folderUpdate = { name }

    if(!name) {
      return res.status(400).json({
        error: { message: 'Request must contain folder name' }
      })
      FoldersService.updateFolder(knexInstance, req.params.id, folderUpdate)
        .then(() => {
          res.status(204).end()
        })
        .catch(next)
    }
  })

module.exports = foldersRouter