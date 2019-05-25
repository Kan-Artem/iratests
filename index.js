const http = require('http');
const path = require('path');
const fromExcel = require('excel-as-json').processFile;

// const {
//   EXCEL_PATH,
// } = process.env;

const EXCEL_PATH = path.join(__dirname, 'tests.xlsx');
const QUESTION_ROW_START = 0;
const QUESTION_NUMBER = 227;
const QUESTION_COLUMN_NAME = 'Текст вопроса';
const ANSWERS_COLUMN_NAMES = [
  'Ответ 1',
  'Ответ 2',
  'Ответ 3',
  'Ответ 4',
];

const server = new http.Server();

let tests = null;

server.on('request', (req, res) => {
  const test = tests[randomQuestionNumber()];
  const { parsed: answers, right } = parseAnswers(test);

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf8' });
  res.end(`
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0">
    <title>ka's art | Test</title>

    <style>
      body {
        margin: 0;
        animation: appear .5s;
      }

      @keyframes appear {
        from { transform: scale(0); opacity: 0 }
        to { transform: scale(1); opacity: 1 }
      }

      h1 {
        opacity: .5;
        margin: 50px;
        border: 1px solid;
        text-align: center;
        padding: 20px 0;
      }

      .q {
        margin: 0 300px;
        font-size: 26px;
      }

      .answers {
        display: flex;
        justify-content: space-around;
        width: 100%;
        margin: 50px 0;
      }

      .answer {
        text-align: center;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px 30px;
        background: #A2A2A2;
        border: 1px solid;
        width: 300px;
        font-size: 20px;
        transition: all .5s;
      }

      .answer:disabled {
        opacity: 1;
        color: #000;
      }

      #next {
        font-size: 20px;
        float: right;
        margin-right: 200px;
        padding: 20px 30px;
        background: #FF942A;
        color: #000;
        border: 3px solid #333;
        box-shadow: 0 0 10px #000;
        cursor: pointer;
        transition: all .5s;
      }

      #next:disabled {
        opacity: .5;
      }

      @media (max-width: 990px) {
        * {
          box-sizing: border-box;
        }

        html, body { height: min-100vh }
        body {
          padding: 5px;
          display: flex;
          flex-direction: column;
        }

        h1 { display: none }
        .q {
          margin: 15px;
          text-align: center;
          font-size: 20px;
        }

        hr {
          width: 100%;
        }

        .box,
        .full {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .answers {
          display: grid;
          grid-template-columns: 1fr;
          grid-gap: 5px;
          justify-items: center;
          margin: 5px;
          margin-top: 10px;
          flex-grow: 1;
          align-self: center;
        }

        .centerify {
          flex-grow: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .answer {
          font-size: 18px;
          box-sizing: border-box;
          padding: 10px 5px;
        }

        #next {
          float: none;
          width: 100%;
        }
      }
    </style>

    <body>
      <div class="full">
        <h1>УЧИСЬ!</h1>
        <div class="box">
          <div class="q">${test[QUESTION_COLUMN_NAME]}</div>
          <hr>
          <div class="centerify">
            <div class="answers">
              <button class="answer" right="${answers[0] === right}">${answers[0]}</button>
              <button class="answer" right="${answers[1] === right}">${answers[1]}</button>
              <button class="answer" right="${answers[2] === right}">${answers[2]}</button>
              <button class="answer" right="${answers[3] === right}">${answers[3]}</button>
            </div>
          </div>
        </div>
      </div>
      <button id="next" disabled="true">Следующий >>></button>

      <script>
        const right = document.querySelector('[right=true]');
        const answers = Array.from(document.getElementsByClassName('answer'));

        answers.forEach(ans => {
          ans.addEventListener('click', () => {
            ans.style.background = '#f00';
            right.style.background = '#0f0'
            next.disabled = false;
            answers.forEach(btn => btn.disabled = true);
          });
        });

        window.addEventListener('keydown', (e) => {
          const { key } = e;
          if (key === '1' || key === '2' || key === '3' || key === '4') {
            answers[key - 1].click();
          } else if (key === ' ') {
            next.click();
          }
          console.log(key);
        });

        next.onclick = () => location.reload();
      </script>
    </body>
  `);
  // res.end(JSON.stringify(tests));
});

fromExcel(EXCEL_PATH, null, null, (err, data) => {
  tests = data;
  server.listen(8080);
});

// =======================
// UTILS
////////////

function random(min, max) {
  return Math.floor(Math.random() * max + min);
}

function randomQuestionNumber() {
  return random(QUESTION_ROW_START, QUESTION_NUMBER + 1);
}

function parseAnswers(test) {
  console.log('QUESTION: ', test[QUESTION_COLUMN_NAME])
  const answers = [
    test[ANSWERS_COLUMN_NAMES[0]],
    test[ANSWERS_COLUMN_NAMES[1]],
    test[ANSWERS_COLUMN_NAMES[2]],
    test[ANSWERS_COLUMN_NAMES[3]],
  ];
  let right = 'Нет правильного ответа';

  const parsed = answers.map(text => {
    text = text.toString().trim();
    if (text.startsWith('*')) {
      return right = text.slice(1).trim();
    } else {
      return text.trim();
    }
  });

  return { parsed, right };
}
