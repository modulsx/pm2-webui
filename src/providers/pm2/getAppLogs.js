
var fs = require('fs');
var es = require('event-stream');

const DEFAULT_LINES_PER_PAGE = 30;
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_SORT_ORDER = 'desc';

function countFileLines(file_path){
  return new Promise((resolve, reject) => {
  let lineCount = 0;
  fs.createReadStream(file_path)
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

const getAppLogs = (params) => {
  return new Promise(async (resolve, reject) => {
    let { file_path, sort_order=DEFAULT_SORT_ORDER, page_number=DEFAULT_PAGE_NUMBER, lines_per_page=DEFAULT_LINES_PER_PAGE} = params;
    if(page_number < 1){
      throw new Error('Page number should be greater or equal to 1')
    }
    if(lines_per_page < 1){
      throw new Error('Lines per page should be greater or equal to 1')
    }
    const total_lines = await countFileLines(file_path) + 1
    let line_start = 0;
    if(sort_order == 'asc'){
      line_start = Math.min(total_lines, ((page_number - 1) * lines_per_page) + 1)
    }
    else{
      line_start = Math.max(0, total_lines - (page_number * lines_per_page) + 1)
    }
    const line_end = Math.min(total_lines, (line_start + lines_per_page) - 1)
    let line_current = 0;
    let lines_data = []
    // console.log('Sort Order : ', sort_order)
    // console.log('Total Lines : ', total_lines)
    // console.log('Line Start : ', line_start)
    // console.log('Line End : ', line_end)
    const stream = fs
    .createReadStream(file_path)
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
      .on('error', reject)
      .on('end', function() {
        resolve(lines_data)
      }),
    ); 
  })
}

async function test(){
  console.time('Performance')
  const logs = await getAppLogs({file_path: '/home/ubuntu/.pm2/logs/admin-service-out.log', page_number: 200, lines_per_page: 100, sort_order:'desc'})
  console.timeEnd('Performance')
  console.log('Output Lines : ',logs.length)
}

module.exports = { getAppLogs }