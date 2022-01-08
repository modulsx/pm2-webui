
var fs = require('fs');
var es = require('event-stream');

const DEFAULT_LINES_PER_PAGE = 50;
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

const readLogs = (params) => {
  return new Promise(async (resolve, reject) => {
    let { file_path, sort_order=DEFAULT_SORT_ORDER, page_number=DEFAULT_PAGE_NUMBER, lines_per_page=DEFAULT_LINES_PER_PAGE} = params;
    page_number = parseInt(page_number)
    if(page_number < 1){
      throw new Error('Page number should be greater or equal to 1')
    }
    if(lines_per_page < 1){
      throw new Error('Lines per page should be greater or equal to 1')
    }
    const total_lines = await countFileLines(file_path) + 1
    let line_start = 1;
    let line_end = 1;
    if(sort_order == 'asc'){
      line_start = Math.min(total_lines, ((page_number - 1) * lines_per_page) + 1)
      line_end = Math.min(total_lines, (line_start + lines_per_page) - 1)
    }
    else{
      line_start = Math.max(1, total_lines - (page_number * lines_per_page) + 1)
      if(line_start === 1){
        line_end = total_lines % lines_per_page;
      }
      else{
        line_end = Math.min(total_lines, (line_start + lines_per_page) - 1)
      }
    }
    let line_current = 1;
    let lines_data = []
    const stream = fs
    .createReadStream(file_path)
    .pipe(es.split())
    .pipe(
      es.mapSync(function(line) {
        if(line_current >= line_start){
          lines_data.push(`${line_current} : ${line}`)
        }
        if(line_current === line_end){
          stream.end();
        }
        line_current++;
      })
      .on('error', reject)
      .on('end', function() {
        let page_order_data = {}
        if(sort_order == 'asc'){
          page_order_data.page_up = (page_number - 1)
          page_order_data.page_down = page_number + 1
        }
        else{
          page_order_data.page_up = page_number + 1
          page_order_data.page_down = (page_number - 1)
        }
        resolve({
          lines: lines_data,
          ...page_order_data,
          page_current: page_number,
          total_pages: Math.ceil(total_lines/lines_per_page)
        }) 
      }),
    ); 
  })
}

async function test(){
  console.time('Performance')
  const logs = await readLogs({file_path: '/home/ubuntu/.pm2/logs/admin-service-out.log', page_number: 200, lines_per_page: 100, sort_order:'desc'})
  console.timeEnd('Performance')
  console.log('Output Lines : ',logs.lines.length)
}

module.exports = { readLogs }