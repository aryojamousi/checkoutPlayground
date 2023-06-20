import styles from '../styles/Home.module.css';
import xml2js from 'xml2js';
import { useState } from 'react';
import { DiffEditor } from "@monaco-editor/react";

function compare( a, b ) {
  if (!a.artname) {
    return -1
  }
  if (!b.artname) {
    return -1;
  }
  if ( a.artname[0] < b.artname[0] ){
    return -1;
  }
  if ( a.artname[0] > b.artname[0] ){
    return 1;
  }
  return 0;
}
function sortShippingInTheBeginning( a, b ) {
  if (a.type[0] === 'porto' || b.type[0] === 'porto'){
    return -1;
  }

  return 0;
}

// Path to the XML file
function sortXML(xml) {
  // Parse the XML data
  const parser = new xml2js.Parser();
  var sorted = null;
  parser.parseString(xml, (err, result) => {
    if (err) {
      console.error('Error parsing XML:', err);
      return;
    }

    result.message.item.sort(compare);
    result.message.item.sort(sortShippingInTheBeginning);
    result.message.item.forEach((element, index) => {
      result.message.item[index] = Object.keys(result.message.item[index]).sort().reduce(
        (obj, key) => { 
          obj[key] = result.message.item[index][key]; 
          return obj;
        }, 
        {}
      );
    });
    var sortedXmlText = {};
    Object.keys(result.message)
    .sort()
    .forEach(function(v, i) {
        sortedXmlText[v] = result.message[v];
     });
  
     // Convert the result back to XML
    const builder = new xml2js.Builder();
    const reversedXmlData = builder.buildObject(sortedXmlText);
    sorted = reversedXmlData;
  });
  return sorted;
};

export default function Home() {
  const [sortedValue, setSortedValue] = useState('');
  
  return (
    <div className={styles.container}>
      <main style={{ display: 'flex'}}>
        <div className={styles.xml}>
          Input Xml 
          <textarea style={{ width: 500, height: 500 }} id="xmlText" />
          <button onClick={() => setSortedValue(sortXML(document.getElementById('xmlText').value))} >Sort</button>
        </div>
        <div className={styles.xml}>
          Sorted Xml 
          <textarea value={sortedValue} readOnly style={{ width: 500, height: 500 }} id="sortedXmlText"/>
          <button onClick={() => {
            setSortedValue(sortXML(document.getElementById('xmlText').value));
            navigator.clipboard.writeText(sortXML(document.getElementById('xmlText').value))
          }}>Sort and copy to clipboard</button>
        </div>
      </main>
      <h2>DIFF EDITOR!</h2>
      <DiffEditor
        options={{ originalEditable: true }}
        height="80vh"
        theme="vs-dark"
      />
      <div style={{ flex: 1 }}>Version: 0.0.1</div>
    </div>
  )
}
