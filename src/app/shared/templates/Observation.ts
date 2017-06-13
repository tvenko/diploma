export class Observation {

  observation: any = {};
  component: any = {};
  category: any = {};
  code: any = {};
  coding: any = {};
  categoryCoding: any = {};
  valueQuantity: any = {};
  identifier: any = {};
  subject: any = {};

  bundle: any = {};

  constructor() {}

  /**
   * Metoda, ki ustvari objekt meritve
   * @param value - vrenost meritve
   * @param type - tip meritve
   * @param subtype - podtip meritve (potrebno za krni tlak)
   * @param patientId - id pacienta
   * @returns {any}
   */
  createObservable(value: number, type: string, subtype: any, patientId: number) {

    this.observation.resourceType = 'Observation';

    this.categoryCoding.system = 'http://hl7.org/fhir/observation-category';
    this.categoryCoding.code = 'vital-signs';
    this.categoryCoding.display = 'Vital Signs';

    this.category.coding = this.categoryCoding;

    this.subject.reference = 'Patient/' + patientId;
    this.observation.subject = this.subject;

    switch (type) {
      case 'bodyWeight': {
        this.coding.code = '3141-9';
        this.valueQuantity.unit = 'kg';
        this.valueQuantity.code = 'kg';
        type = 'body weight';
        this.createSimple(value, type);
        break;
      }
      case 'heartRate': {
        this.coding.code = '8867-4';
        this.valueQuantity.unit =  '/min';
        this.valueQuantity.code =  '/min';
        type = 'heart rate';
        this.createSimple(value, type);
        break;
      }

      case 'oxygenSaturation': {
        this.coding.code = '59408-5';
        this.valueQuantity.unit =  '%';
        this.valueQuantity.code =  '%';
        type = 'oxygen saturation';
        this.createSimple(value, type);
        break;
      }

      case 'bodyTemperature': {
        this.coding.code = '8310-5';
        this.valueQuantity.unit =  'Cel';
        this.valueQuantity.code =  'Cel';
        type = 'body temperature';
        this.createSimple(value, type);
        break;
      }

      case 'bloodPressure': {
        console.log(subtype);
        this.coding.code = '55284-4';
        type = 'Blood Pressure';
        this.createHead(type);
        for (const observable of subtype) {
          if (observable.type === 'systolicPressure') {
            this.createComponent(observable.value, 'Systolic Blood Pressure', '8480-6', 'mm[Hg]');
          }
          if (observable.type === 'diastolicPressure') {
            this.createComponent(observable.value, 'Diastolic Blood Pressure', '8462-4', 'mm[Hg]');
          }
        }
      }
    }

    return this.observation;
  }

  /**
   * V primeru da meritev ni krvni tlak se objekt meritve zgenerira po tej metodi
   * @param value - vrednost meritve
   * @param type - tip meritve
   */
  createSimple(value: number, type: string) {
    this.coding.display = type;
    this.coding.system = 'http://loinc.org';
    this.valueQuantity.system = 'http://unitsofmeasure.org';

    this.identifier.value = 'patronaza1';
    this.observation.identifier = this.identifier;

    this.category.text = type;
    this.observation.category = this.category;

    this.code.coding = this.coding;
    this.code.text = type;

    this.observation.code = this.code;

    this.valueQuantity.value = value;

    this.observation.valueQuantity = this.valueQuantity;
  }

  /**
   * V primeru krvnega tlaka se najprej zgenerirajo splosne informacije v objektu, ki so skupne obema krvnima tlakoma
   * @param type - tip meritve(==bloodPressure)
   */
  createHead(type: string) {
    this.coding.display = type;
    this.coding.system = 'http://loinc.org';
    this.valueQuantity.system = 'http://unitsofmeasure.org';

    this.category.text = type;
    this.observation.category = this.category;

    this.code.coding = this.coding;
    this.code.text = type;

    this.identifier.value = 'patronaza1';
    this.observation.identifier = this.identifier;

    this.observation.code = this.code;
    this.observation.component = [];
  }

  /**
   * V primeru krvnega tlaka se za vsak krvni tlak posebej dodajo se podatki o sistolicnem in diastolicnem tlaku v objekt meritve
   * @param value - vrednost mertirve
   * @param type - tip meritve
   * @param c - koda meritve
   * @param unit - merska enota meritve
   */
  createComponent(value: number, type: string, c: string, unit: string ) {

    const category: any = {};
    const component: any = {};
    const code: any = {};
    const coding: any = {};
    const valueQuantity: any = {};

    coding.display = type;
    coding.code = c;
    coding.system = 'http://loinc.org';
    valueQuantity.system = 'http://unitsofmeasure.org';
    valueQuantity.unit =  unit;
    valueQuantity.code =  unit;

    category.text = type;
    component.category = category;

    code.coding = coding;
    code.text = type;

    component.code = code;

    valueQuantity.value = value;

    component.valueQuantity = valueQuantity;

    this.observation.component.push(component);
  }
}
