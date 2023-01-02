const puppeteer = require('puppeteer')
const { Telegraf } = require('telegraf')
const { Keyboard, Key } = require('telegram-keyboard')
require('dotenv').config()
const bot = new Telegraf(process.env.API_KEY)
const notifier = require('node-notifier')

const keyboard = Keyboard.make([
    Key.callback('❌ Excluir', 'delete'),
    
  ])

  console.log("GLPI_BOT INICIADO !")

  notifier.notify({
    title: 'GLPI_BOT INICIADO !',
    message: ' '
  });


bot.command(['id','ID','Id','iD'], async function(ctx) {
    try{
        console.log("Buscando informações")
    var msg = ctx.update.message.text.split(' ')
    ctx.deleteMessage();
    const browser = await puppeteer.launch({devtools: false})
    const page = await browser.newPage()
    
    await page.goto('http://helpdesksaude.intranet.pref/glpi/index.php')

    var login = await page.waitForSelector("#login_name")
    await login.type(process.env.USER)
    var senha = await page.waitForSelector("#login_password")
    await senha.type(process.env.PASSW)
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(3000);

    await page.goto('http://helpdesksaude.intranet.pref/glpi/ajax/common.tabs.php?_target=/glpi/front/ticket.form.php&_itemtype=Ticket&_glpi_tab=Ticket$main&id='+msg[1]+'&')
    var nome = await page.waitForSelector("#mainformtable4 > tbody > tr:nth-child(7) > td:nth-child(2) > input[type=text]")
    nome = await page.evaluate(nome => nome.value, nome)

    var unidade = await page.waitForSelector("#mainformtable2 > tbody > tr:nth-child(4) > td:nth-child(4) > span > select > option ")
    unidade = await page.evaluate(unidade => unidade.textContent, unidade)

    var setor = await page.waitForSelector("#mainformtable4 > tbody > tr:nth-child(8) > td > span > select > option ")
    setor = await page.evaluate(setor => setor.textContent, setor)

    var descricao = await page.waitForSelector("#mainformtable4 > tbody > tr:nth-child(2) > td > div > textarea ")
    descricao = await page.evaluate(descricao => descricao.textContent, descricao)

    descricao = descricao.replace("<p>"," ")
    descricao = descricao.replace("</p>"," ")

    console.log("Nome: " + nome + '\nUnidade: ' + unidade + '\nSetor: ' + setor + '\nDescição: ' + descricao)

        if(msg[3] != undefined){
            ctx.reply("CHAMADO \n\nNOME: " + nome + '\nUNIDADE: ' + unidade + '\nSETOR: ' + setor + '\nDESCRIÇÃO: ' + descricao+"\n"+msg[3]+" "+msg[2], keyboard.inline())

        }else if(msg[2] != undefined){
            ctx.reply("CHAMADO \n\nNOME: " + nome + '\nUNIDADE: ' + unidade + '\nSETOR: ' + setor + '\nDESCRIÇÃO: ' + descricao+"\n"+msg[2], keyboard.inline())
        }else{
            ctx.reply("CHAMADO \n\nNOME: " + nome + '\nUNIDADE: ' + unidade + '\nSETOR: ' + setor + '\nDESCRIÇÃO: ' + descricao, keyboard.inline())
        }

    }catch(err){
        ctx.reply("❗ Houve um problema ao buscar o chamado, verifique o ID e tente novamente ❗\n" , keyboard.inline())
        console.log(err)
    }
    
})

bot.command('help', async function(ctx){
    ctx.deleteMessage();
    ctx.reply('Escopo do comando: \n "/id id_do_chamado @pessoa1(opicional) @pessoa2(opicional)"', keyboard.inline());
})

bot.action('delete', ctx => ctx.deleteMessage())
bot.launch();

