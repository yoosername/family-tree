import uuidv4 from 'uuid/v4';

class FamilyMemberModel {

  constructor(obj){
    const uuid = uuidv4();
    this._data = Object.assign({}, {
      key: uuid,
      firstName: "",
      lastName: "",
      dob: "",
      pob: "",
      occupation: "",
      address: "",
      uuid: uuid,
      parentUUID: 0
    }, obj);;
  }

  getKey(){
    return this._data.key;
  }
  setKey(key){
    this._data.key = key;
  }
  getFirstName(){
    return this._data.firstName;
  }
  setFirstName(firstName){
    this._data.firstName = firstName;
  }
  getLastName(){
    return this._data.lastName;
  }
  setLastName(lastName){
    this._data.lastName = lastName;
  }
  getDOB(){
    return this._data.dob;
  }
  setDOB(dob){
    this._data.dob = dob;
  }
  getPOB(){
    return this._data.pob;
  }
  setPOB(pob){
    this._data.pob = pob;
  }
  getOccupation(){
    return this._data.occupation;
  }
  setOccupation(occupation){
    this._data.occupation = occupation;
  }
  getAddress(){
    return this._data.address;
  }
  setAddress(address){
    this._data.address = address;
  }
  getUUID(){
    return this._data.uuid;
  }
  setUUID(uuid){
    this._data.uuid = uuid;
  }
  getParentUUID(){
    return this._data.parentUUID;
  }
  setParentUUID(uuid){
    this._data.parentUUID = uuid;
  }

}

export default FamilyMemberModel;
