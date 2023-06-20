import Head from 'next/head';
import styles from '../styles/Home.module.css';
import xml2js from 'xml2js';
import { useState } from 'react';

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
    result.message.item.forEach((element, index) => {
      result.message.item[index] = Object.keys(result.message.item[index]).sort().reduce(
        (obj, key) => { 
          obj[key] = result.message.item[index][key]; 
          return obj;
        }, 
        {}
      );
    });

    // Convert the result back to XML
    const builder = new xml2js.Builder();
    const reversedXmlData = builder.buildObject(result);
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
          <textarea style={{ width: 200, height: 500 }} id="xmlText" />
          <button onClick={() => setSortedValue(sortXML(document.getElementById('xmlText').value))} >Sort</button>
        </div>
        <div className={styles.xml}>
          Sorted Xml 
          <textarea value={sortedValue} readOnly style={{ width: 200, height: 500 }} id="sortedXmlText"/>
          <button onClick={() => {
            setSortedValue(sortXML(document.getElementById('xmlText').value));
            navigator.clipboard.writeText(sortXML(document.getElementById('xmlText').value))
          }}>Sort and copy to clipboard</button>
        </div>
      </main>
    </div>
  )
}
