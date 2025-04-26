const readline = require("readline");
const players = require("./players");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function listPlayers() {
  players.forEach((player, index) => {
    console.log(`${index} - ${player.NOME}`);
  });
}

function askPlayer(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (input) => {
      const index = parseInt(input);
      if (isNaN(index) || index < 0 || index >= players.length) {
        console.log("Escolha inválida. Tente novamente.");
        resolve(askPlayer(prompt));
      } else {
        resolve(players[index]);
      }
    });
  });
}

async function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

async function getRandomBlock() {
  let random = Math.random();
  if (random < 0.33) return "RETA";
  if (random < 0.66) return "CURVA";
  return "CONFRONTO";
}

async function logRollResult(characterName, block, diceResult, attribute) {
  console.log(
    `${characterName} 🎲 rolou um dado de ${block} ${diceResult} + ${attribute} = ${diceResult + attribute}`
  );
}

async function playRaceEngine(player1, player2) {
  for (let round = 1; round <= 5; round++) {
    console.log(`🏁 Rodada ${round}`);
    const block = await getRandomBlock();
    console.log(`Bloco: ${block}`);

    const dice1 = await rollDice();
    const dice2 = await rollDice();

    let total1 = 0;
    let total2 = 0;

    if (block === "RETA") {
      total1 = dice1 + player1.VELOCIDADE;
      total2 = dice2 + player2.VELOCIDADE;
      await logRollResult(player1.NOME, "velocidade", dice1, player1.VELOCIDADE);
      await logRollResult(player2.NOME, "velocidade", dice2, player2.VELOCIDADE);
    }

    if (block === "CURVA") {
      total1 = dice1 + player1.MANOBRABILIDADE;
      total2 = dice2 + player2.MANOBRABILIDADE;
      await logRollResult(player1.NOME, "manobrabilidade", dice1, player1.MANOBRABILIDADE);
      await logRollResult(player2.NOME, "manobrabilidade", dice2, player2.MANOBRABILIDADE);
    }

    if (block === "CONFRONTO") {
      const power1 = dice1 + player1.PODER;
      const power2 = dice2 + player2.PODER;

      console.log(`${player1.NOME} confrontou com ${player2.NOME}! 🥊`);
      await logRollResult(player1.NOME, "poder", dice1, player1.PODER);
      await logRollResult(player2.NOME, "poder", dice2, player2.PODER);

      if (power1 > power2 && player2.PONTOS > 0) {
        player2.PONTOS--;
        console.log(`${player1.NOME} venceu o confronto! ${player2.NOME} perdeu 1 ponto 🐢`);
      } else if (power2 > power1 && player1.PONTOS > 0) {
        player1.PONTOS--;
        console.log(`${player2.NOME} venceu o confronto! ${player1.NOME} perdeu 1 ponto 🐢`);
      } else if (power1 === power2) {
        console.log("Confronto empatado! Nenhum ponto foi perdido");
      }
    }

    if (total1 > total2) {
      player1.PONTOS++;
      console.log(`${player1.NOME} marcou um ponto!`);
    } else if (total2 > total1) {
      player2.PONTOS++;
      console.log(`${player2.NOME} marcou um ponto!`);
    }

    console.log("-----------------------------");
  }
}

async function declareWinner(player1, player2) {
  console.log("Resultado final:");
  console.log(`${player1.NOME}: ${player1.PONTOS} ponto(s)`);
  console.log(`${player2.NOME}: ${player2.PONTOS} ponto(s)`);

  if (player1.PONTOS > player2.PONTOS)
    console.log(`\n${player1.NOME} venceu a corrida! Parabéns! 🏆`);
  else if (player2.PONTOS > player1.PONTOS)
    console.log(`\n${player2.NOME} venceu a corrida! Parabéns! 🏆`);
  else console.log("A corrida terminou em empate");
}

async function main() {
  console.log("🏁 Selecione seus jogadores:");
  listPlayers();

  const player1 = await askPlayer("Escolha o número do primeiro jogador: ");
  let player2;
  do {
    player2 = await askPlayer("Escolha o número do segundo jogador: ");
    if (player1.NOME === player2.NOME) {
      console.log("Os jogadores devem ser diferentes.");
    }
  } while (player1.NOME === player2.NOME);

  console.log(`\nCorrida entre ${player1.NOME} e ${player2.NOME} começando...\n`);

  await playRaceEngine(player1, player2);
  await declareWinner(player1, player2);

  rl.close();
}

main();
