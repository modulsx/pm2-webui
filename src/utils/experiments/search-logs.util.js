var fs = require('fs');
var es = require('event-stream');

const MAX_RESULTS = 30;

function findTerm(line, term) {
    return line.indexOf(term) !== -1
  }

const searchLogs = async (filePath, term, max_results = MAX_RESULTS) => {
    let line_current = 0;
    let lines_data = []
    const stream = fs
    .createReadStream(filePath)
    .pipe(es.split())
    .pipe(
      es.mapSync(function(line) {
        line_current++;
        if(findTerm(line, term)){
          lines_data.push({line_number: line_current, line: line})
        }
        if(lines_data.length === max_results){
          stream.end();
        }
      })
      .on('error', function(err) {
        console.log('Error while reading file.', err);
      })
      .on('end', function() {
        console.log(lines_data)
      }),
    ); 
}

function test(){
  // searchLogs('/home/ubuntu/.pm2/logs/admin-service-out.log', 'is_deleted: false')
}
module.exports  = { searchLogs }