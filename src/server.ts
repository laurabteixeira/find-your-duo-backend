import express, { response } from "express";

import cors from "cors"

import { PrismaClient } from '@prisma/client'

import { convertHourStringToMinutes } from "./utils/conver-hour-string-to-minutes";
import { convertMinutesToHourString } from "./utils/convert-minutes-to-hour-string";

const app = express()

app.use(express.json());

app.use(cors());

const prisma = new PrismaClient({
  log: ['query']
});

app.get('/games', async (request, response) => {
  // Listagem de games com seus ads.
  const games = await prisma.game.findMany({
    // Adiciona anúncios disponíveis criados em Ad.
    include: {
      _count: {
        select: {
          ads: true,
        }
      }
    }
  })

  return response.json(games)
})

app.post('/games/:id/ads', async (request, response) => {
  // Criação de anúncio.
  const gameId = request.params.id;

  const body = request.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,
    }
  })

  return response.status(201).json(ad)
})

app.get('/games/:id/ads', async (request, response) => {
  // Listagem de ads baseado no gameId.
  const gameId = request.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      yearsPlaying: true,
      weekDays: true,
      hourStart: true,
      hourEnd: true,
      useVoiceChannel: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return response.json(ads.map(ad => {
    // Retorna todos os dados de ads, dando split no weekDays para transformá-lo num array onde cada posição é um dia da semana.
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: convertMinutesToHourString(ad.hourStart),
      hourEnd: convertMinutesToHourString(ad.hourEnd),
    }
  }))
}) 

app.get('/ads/:id/discord', async (request, response) => {
  // Listagem do Discord baseado no id do anúncio.
  const adId = request.params.id;
  //const ad = await prisma.ad.findUniqueOrThrow()
  const discord = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true
    },
    where: {
      id: adId
    }
  })

  return response.json(discord);
  // return response.json({
  //   discord: ad.discord;
  // });
})  

app.listen(3333)



// Status codes que começam com: 2 (sucesso), 3 (redirecionamento), 4 (erro da aplicação), 5 (erros inesperados). Mais informações: MDN.

// Query, Route, Body

// Maneiras de comunicação com o banco de dados:
// Driver nativo: faz o Node se comunicar com o banco de dados de maneira um pouco menos amigável.

// Query builder: serve para converter a linguagem com a qual estamos trabalhando (ex: JS, TS) e convertê-la para SQL por debaixo dos panos. Um dos Query Builder mais usados é o Knex.js

// ORM: faz uma relação das tabelas do banco de dados com classes/entidades no TS, JS. A query é parecida com o query builder, mas as classes se relacionam com as tabelas do banco de dados, trazendo maior facilidade. Um dos ORM mais usados é o Prisma.

// O cors serve para impedir que outros frontends acessem o backend. Como não foi passado para o cors qual o domínio que pode acessar esse backend, qualquer frontend pode fazer requisições para ele. 

// O cors não entende TypeScript. Depois de rodar 'npm i cors', rodar 'npm i @types/cors -D'. 