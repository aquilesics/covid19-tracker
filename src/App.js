import React, { useState, useEffect} from"react";
import { Card, CardContent, Typography, FormControl, MenuItem, Select } from '@material-ui/core';
import './App.css';
import InfoBox from "./InfoBox";
import Map from "./Map"
import Table from './Table.js'
import { sortData } from "./util";
import LineGraph from './LineGraph'
import "leaflet/dist/leaflet.css"
import { map } from "leaflet";
import { prettyPrintStat } from './util.js'

function App() {
  const [ countries, setCountries ] = useState([]);
  const [country, setCountry ] = useState('worldwide');
  const [ countryInfo, setCountryInfo ] = useState({});
  const [ tableData, setTableData]  = useState([]);
  const [ mapCenter, setMapCenter ] = useState({ lat: 10.80746, lng: -55.4796 });
  const [ mapZoom, setMapZoom ] = useState(2);
  const [ mapCountries, setMapCountries ] = useState([]);
  const [ casesType, setCasesType  ] = useState('cases');


  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data)
    })

  },[])
 
  useEffect(() => {
    //assync => send request and wait for the response

    const getCountriesData = async() => {
      await fetch('https://disease.sh/v3/covid-19/countries')
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country)=> (
          {
            name:country.country, //Brazil
            value:country.countryInfo.iso2 //Uk,Usa,BR
          }
        ));
        let sortedData = sortData(data);
        setTableData(sortedData);
        setCountries(countries);
        setMapCountries(data);
        

      });
    };

    getCountriesData()

  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    // setCountry(countryCode);

  const url = countryCode === 'worldwide' 
    ? 'https://disease.sh/v3/covid-19/all' 
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`

  await fetch(url)
  .then((response) => response.json()
  .then((data) => {
    setCountry(countryCode)
    setCountryInfo(data);
    setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
    setMapZoom(4);
   
  }))
};


  return (
    <div className="app">
      <div className='app__left'>
        <div className='app__header'>    
          <h1>COVID-19 TRACKER</h1>
          <FormControl className='app__dropdown'>
            <Select variant='outlined' onChange={onCountryChange} value={country}>
            <MenuItem value='worldwide'>worldwide</MenuItem>
              {
                countries.map(country =>(
                  <MenuItem value={country.value} >{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
             <InfoBox
               isRed
               active={casesType === 'cases'} 
               onClick={(e) => setCasesType("cases")}
               title="Coronavirus cases" 
               total={prettyPrintStat(countryInfo.cases)} 
               cases={prettyPrintStat(countryInfo.todayCases)}
             />

             <InfoBox
                
               active={casesType === 'recovered'}
               onClick={(e) => setCasesType("recovered")}
               title="Recovered" 
               total={prettyPrintStat(countryInfo.recovered)} 
               cases={prettyPrintStat(countryInfo.todayRecovered)}
             />

             <InfoBox
               isRed
               active={casesType === 'deaths'}
               onClick={(e) => setCasesType("deaths")}
               title="Deaths" 
               total={prettyPrintStat(countryInfo.deaths)} 
               cases={prettyPrintStat(countryInfo.todayDeaths)}
             />    
        </div>

        <Map center={mapCenter} zoom={mapZoom}  countries={mapCountries} casesType={casesType}/>
        {console.log('🀄',mapCountries)}
      </div>
      <Card className='app__right'>
        <CardContent>
          <h3>Live Cases by country</h3>
          <Table countries={tableData}/>
          <h3>Worldwide new {casesType}</h3>
          <LineGraph casesType={casesType} className='app__graph'/>
        </CardContent>
      </Card>
    </div>
  );  
} 

export default App;
