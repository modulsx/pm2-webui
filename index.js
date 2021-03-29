
const fs = require('fs');
const es = require('event-stream');

const DEFAULT_LINES_PER_PAGE = 30;
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_SORT_ORDER = 'desc';


var getLogs = function (params) {
  let { filePath, sort_order=DEFAULT_SORT_ORDER, page_number=DEFAULT_PAGE_NUMBER, lines_per_page=DEFAULT_LINES_PER_PAGE} = params;
  return new Promise((resolve, reject) => {
    const fileSize =  fs.statSync(filePath).size
    console.log('Filesize : ', fileSize)
    let chunk = '';
    let options = {};
    let line_cursor = 0;
    if(sort_order === 'asc'){
      line_cursor = (page_number - 1) * lines_per_page
      options.start = Math.max(0, line_cursor * 200);
      options.end = Math.min(fileSize, options.start + (lines_per_page * 200));
    }
    else{
      line_cursor = page_number * lines_per_page
      options.start = Math.max(0, fileSize - (line_cursor * 200));
      options.end = Math.min(fileSize, options.start + (lines_per_page * 200));
    }
    console.log('Line Cursor : ', line_cursor)
    console.log('Options : ',options)
    const fd = fs.createReadStream(filePath, options);
    fd.on('data', function(data) { chunk += data.toString(); });
    fd.on('error', reject)
    fd.on('end', function() {
      chunk = chunk.split('\n')
      const lines_limit = Math.min(chunk.length, lines_per_page);
      if(sort_order === 'asc'){
        chunk = chunk.slice(0,(lines_limit+1));
      }
      else{
        chunk = chunk.slice(-(lines_limit+1));
      }
      chunk.pop();
      resolve(chunk);
    });
  })
};

async function main(){
  console.time('Method-1')
  const logs = await getLogs({filePath: '/home/ubuntu/.pm2/logs/admin-service-out.log', page_number: 1, lines_per_page: 4, sort_order:'desc'})
  console.timeEnd('Method-1')
  console.log(logs.length)
  logs.forEach(log => {
    console.log(log)
  });
}

main()