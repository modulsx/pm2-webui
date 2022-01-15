const Joi = require('joi');

const appSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('frontend', 'backend').required(),
    path: Joi.string().required(),
    git_remote: Joi.string().required(),
    git_branch: Joi.string().required(),
    webhook_secret: Joi.string().required(),
    exec_commands: Joi.array().items(Joi.string())
})

const deployHooksSchema = Joi.object({
    apps: Joi.array().items(appSchema).required(),
})

module.exports = {
    deployHooksSchema
}
