const Mongo = require('mongoose')
const Models = require('../models')

class DataManager {
  constructor (client) {
    this.client = client
    this.connection = Mongo.connection
  }

  init () {
    const options = this.client._options
    const logger = this.client.logger
    logger.info(`[DataBase] [INIT] Connecting URL (${options.db.mongo.mongoURL})`)
    Mongo.connect(options.db.mongo.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true, user: options.db.mongo.user, pass: options.db.mongo.password })
  }

  async checkGuildMember (guildMember) {
    this.client.logger.debug(`[DataBase] [Guild] [Member] Checking GuildMember: (${this.getGuildMemberID(guildMember, guildMember.guild.id)})`)
    const mongoResult = await this.connection.collection('guildMember').findOne({ _id: this.getGuildMemberID(guildMember, guildMember.guild.id) })
    if (!mongoResult) {
      this.client.logger.info(`[DataBase] [Guild] [Member] GuildMember does not exist, create one. (${this.getGuildMemberID(guildMember, guildMember.guild.id)})`)
      const Model = new Models.GuildMember({
        _id: this.getGuildMemberID(guildMember, guildMember.guild.id)
      })
      await Model.save()
      this.client.logger.debug(`[DataBase] [Guild] [Member] Saving... ${this.getGuildMemberID(guildMember, guildMember.guild.id)}`)
    }
  }

  async checkGlobalMember (guildMember) {
    this.client.logger.debug(`[DataBase] [Global] [Member] Checking GlobalMember (Member: ${guildMember.id})`)
    const mongoResult = await this.connection.collection('globalMember').findOne({ _id: guildMember.id })
    if (!mongoResult) {
      this.client.logger.info(`[DataBase] [Global] [Member] Global Member is not exist, create one. (Member: ${guildMember.id})`)
      const Model = new Models.GlobalMember({
        _id: guildMember.id
      })
      await Model.save()
      this.client.logger.debug(`[DataBase] [Global] [Member] Saving... (Member: ${guildMember.id})`)
    }
  }

  async checkGuild (guild) {
    this.client.logger.debug(`[DataBase] [Guild] Checking Guild (Guild: ${guild.id})`)
    const mongoGuild = await this.connection.collection('guild').findOne({ _id: guild.id })
    if (!mongoGuild) {
      this.client.logger.info(`[DataBase] [Guild] Guild is not exist, create one. (Guild: ${guild.id})`)
      const Model = new Models.Guild({
        _id: guild.id
      })
      await Model.save()
      this.client.logger.debug(`[DataBase] [Guild] Saving... (Guild: ${guild.id})`)
    }
  }

  async deleteGuild (guild) {
    this.client.logger.debug(`[DataBase] [Guild] Removing Guild From Database.. (Guild: ${guild.name})`)
    const res = await this.connection.collection('guild').deleteOne({ _id: guild.id })
    this.client.logger.debug(`[DataBase] [Guild] Removed Guild From DatabBase. (Guild: ${guild.name}) Result: ${JSON.stringify(res)}`)
  }

  async getGuildData (id) {
    return await this.connection.collection('guild').findOne({ _id: id })
  }

  async getGlobalUserData (user) {
    return await this.connection.collection('globalMember').findOne({ _id: user.id })
  }

  async getGuildMemberData (user) {
    return await this.connection.collection('guildMember').findOne({ _id: this.getGuildMemberID(user, user.guild.id) })
  }

  async updateGuildData (guild, query) {
    return await this.connection.collection('guild').updateOne({ _id: guild }, query)
  }

  async updateGlobalUserData (member, query) {
    return await this.connection.collection('globalMember').updateOne({ _id: member.id }, query)
  }

  getGuildMemberID (user, guild) {
    return `${user.id}-${guild}`
  }
}
module.exports = DataManager
