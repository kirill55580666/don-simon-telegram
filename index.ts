import TelegramBot = require('node-telegram-bot-api')
import { randomNumber } from './utils'
import { type Sticker } from 'node-telegram-bot-api'
import { Commands } from './types/types'

const token = '6711731033:AAGv-yVEdetp03FImNUQfJ3f5qRVQYgwJ1w'

const bot = new TelegramBot(token, { polling: true })

type ReturnType<T> = T extends (...args: any) => infer U ? U : never
type ArgsType<T> = T extends (...args: infer U) => any ? U : never
type CustomAwaited<T> = T extends Promise<infer U> ? U : T
const randomSticker = (stickers: CustomAwaited<ReturnType<typeof bot.getStickerSet>>['stickers']): Sticker =>
  stickers[randomNumber(0, stickers.length - 1)]

const chats: Record<string, string> = {}
const gameOptions: ArgsType<typeof bot.sendMessage>[2] = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '1', callback_data: '1' }, { text: '2', callback_data: '2' }, { text: '3', callback_data: '3' }],
      [{ text: '4', callback_data: '4' }, { text: '5', callback_data: '5' }, { text: '6', callback_data: '6' }],
      [{ text: '7', callback_data: '7' }, { text: '8', callback_data: '8' }, { text: '9', callback_data: '9' }],
      [{ text: '0', callback_data: '0' }]
    ]
  }
}
const againOptions: ArgsType<typeof bot.sendMessage>[2] = {
  reply_markup: {
    inline_keyboard: [[{ text: 'Играть еще раз', callback_data: '/again' }]]
  }
}
const startGame = async (chatId: number): Promise<void> => {
  await bot.sendMessage(chatId, 'Я загадал число от 0 до 9, нужно отгадать.')
  const randomDigit = randomNumber(0, 9)
  chats[chatId] = String(randomDigit)
  await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

bot.getStickerSet('Donsifon_by_fStikBot').then(async (response) => {
  const donSimonStickerSet = response

  await bot.setMyCommands([
    { command: Commands.START, description: 'Приветствие' },
    { command: Commands.INFO, description: 'Информация о пользователе' },
    { command: Commands.GAME, description: 'Загадать число' },
    { command: Commands.RANDOM_STICKER, description: 'Рандомный ДОН-СИМОН' }
  ])
  bot.on('message', async (msg) => {
    const { text, chat: { id: chatId } } = msg
    console.log(msg)

    const sendMessage = async (text: string): ReturnType<typeof bot.sendMessage> => {
      return await bot.sendMessage(chatId, text)
    }
    try {
      switch (text) {
        case Commands.START:
          await sendMessage(`Добро пожаловать в игру ${msg.from?.first_name ?? 'друг'}`)
          await bot.sendSticker(chatId, 'CAACAgIAAxkBAAMTZXH1B6anmVdmOwABzdm23eDyBEWgAALTFAACNrgxSGFzGB1lwFnJMwQ')
          break
        case Commands.INFO:
          await sendMessage(`Тебя зовут ${msg.from?.first_name ?? ''}`)
          break
        case Commands.RANDOM_STICKER:
          await bot.sendSticker(chatId, randomSticker(donSimonStickerSet.stickers).file_id)
          break
        case Commands.GAME: {
          await startGame(chatId)
          break
        }
        default:
          await sendMessage('Я вас не понял, попробуйте воспользоваться командой из списка')
      }
    } catch (e) {
      console.error(e)
    }
  })
  bot.on('callback_query', async (msg) => {
    const { data, message } = msg
    const chatId = message?.chat?.id
    console.log(msg)
    if (chatId === undefined || data === undefined) return

    if (data === Commands.AGAIN) {
      await startGame(chatId)
      return
    }
    // const user = await UserModel.findOne({ chatId })
    if (data === chats[chatId]) {
      // user.right += 1
      await bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}`, againOptions)
    } else {
      // user.wrong += 1
      await bot.sendMessage(chatId, `К сожалению ты не угадал, бот загадал цифру ${chats[chatId]}`, againOptions)
    }
    // await user.save()
  })
}).catch((e) => { console.error(e) })
