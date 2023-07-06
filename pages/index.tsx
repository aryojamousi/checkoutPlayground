import styles from '../styles/Home.module.css';
import xml2js from 'xml2js';
import { useState } from 'react';
import { DiffEditor } from "@monaco-editor/react";
const EXCLUDING_TAGS = ['CCBrand', 'CCExpiry', 'PCNr', 'brandcheck', 'cgi_ss', 'cmuid_cookie', 'comment/> --> if emp', 'init_referer', 'eci', 'mobile', 'pagecoun', 'url_pag', 'url_parms', 'url_subpage', 'utf', 'zone'];

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
    if (result === null) {
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

     EXCLUDING_TAGS.forEach(element => {
      delete sortedXmlText[element];
     });
  
     // Convert the result back to XML
    const builder = new xml2js.Builder();
    const reversedXmlData = builder.buildObject(sortedXmlText);
    sorted = reversedXmlData;
  });
  return sorted;
};

export default function Home() {
  const [ncXMLSortedValue, setNcXMLSortedValue] = useState('');
  const [checkoutServiceSortedValue, setCheckoutServiceSortedValue] = useState('');
  
  const getSortedXmlValueFromInput = (elementId) => sortXML((document.getElementById(elementId) as HTMLInputElement).value);

  const onChange = () => {
    setNcXMLSortedValue(getSortedXmlValueFromInput('xmlText'));
    setCheckoutServiceSortedValue(getSortedXmlValueFromInput('sortedXmlText'));
  };

  return (
    <div className={styles.container}>
      <main style={{ display: 'flex'}}>
        <div className={styles.xml}>
          Old NC XML
          <textarea style={{ width: 500, height: 100 }} id="xmlText" onChange={onChange} />
        </div>
        <div className={styles.xml}>
          Checkout Service XML
          <textarea onChange={onChange} style={{ width: 500, height: 100 }} id="sortedXmlText"/>
        </div>
      </main>
      <h2>DIFF EDITOR!</h2>
      <DiffEditor
        original={ncXMLSortedValue}
        modified={checkoutServiceSortedValue}
        options={{ originalEditable: true }}
        height="80vh"
        theme="vs-dark"
      />
      <div style={{ flex: 1 }}>Version: 0.0.1</div>
    </div>
  )
}
