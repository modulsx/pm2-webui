
var fs = require('fs');
var es = require('event-stream');
var now = require('performance-now');
const { resolve } = require('path');

const MAX_LINES = 30;

function countFileLines(filePath){
  return new Promise((resolve, reject) => {
  let lineCount = 0;
  fs.createReadStream(filePath)
    .on("data", (buffer) => {
      let idx = -1;
      lineCount--; // Because the loop will run once for idx=-1
      do {
        idx = buffer.indexOf(10, idx+1);
        lineCount++;
      } while (idx !== -1);
    }).on("end", () => {
      resolve(lineCount);
    }).on("error", reject);
  });
};

const streamLogs = async (filePath, start_line, max_lines=MAX_LINES) => {
  const total_lines = await countFileLines(filePath) + 1
  const line_start = start_line ? start_line: total_lines - max_lines;
  const line_end = line_start + max_lines
  let line_current = 0;
  let lines_data = []
  const stream = fs
  .createReadStream(filePath)
  .pipe(es.split())
  .pipe(
    es.mapSync(function(line) {
      line_current++;
      if(line_current >= line_start){
        lines_data.push(line)
      }
      if(line_current === line_end){
        stream.end();
      }
    })
    .on('error', function(err) {
      console.log('Error while reading file.', err);
    })
    .on('end', function() {
      console.log(lines_data.join("\n"))
    }),
  ); 
}

async function main(){
  console.time('Method-1')
  streamLogs('/home/ubuntu/.pm2/logs/admin-service-out.log', 4)
  console.timeEnd('Method-1')
}

main()