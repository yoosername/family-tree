import React, { Component } from 'react';
import './Family.css';
import { Button, Modal, ControlLabel, FormGroup, HelpBlock, FormControl } from 'react-bootstrap';
import uuidv4 from 'uuid/v4';

// TODO: Clicking on a member should be edit mode for the member
// TODO: Adding member should create member with default values
//       and auto enter edit mode

/*
Add Button for Main page
*/
class AddFamilyMemberButton extends Component {

  render() {
    return (
      <Button onClick={this.props.onClick} bsSize="large" bsClass="btn btn-success btn-circle"><i className="glyphicon glyphicon-tree-deciduous"></i></Button>
    );
  }
}

/**
  Start with a single empty root node.
  Each Node can be edited and
  handles ability to add descendents
  container maintains the tree for persistance purposes
**/
class FamilyContainer extends Component {

  constructor(props){
    super(props);

      if( localStorage.getItem('family') != null ){
        //console.log("from storage",JSON.parse(localStorage.getItem('family')));
        this.state = {
          family : JSON.parse(localStorage.getItem('family'))
        }
      }else{
        this.state = {
          family: []
        };
      }

  }

  addNewRootFamilyMember= () =>{
    //console.log("adding new root family member");
    const uuid = uuidv4();
    const member = {
      key: uuid,
      firstName: "",
      lastName: "",
      uuid: uuid,
      parentUUID: 0
    }
    var latest = this.state.family.slice();
    latest.push(member)
    this.setState({family:latest});
    localStorage.setItem('family', JSON.stringify(latest));
    console.log("added root family member: ", member);
  }

  addFamilyMember = (member) =>{
    //console.log("adding new family member: ", member);
    const uuid = uuidv4();
    member.uuid = uuid;
    member.key = uuid;
    var latest = this.state.family.slice();
    latest.push(member)
    this.setState({family:latest});
    localStorage.setItem('family', JSON.stringify(latest));
    console.log("added family member: ", member, " as child of uuid: ", member.parentUUID);
  }

  updateFamilyMember = (member) =>{
    var family = this.state.family;
    family.forEach(function(memberToUpdate, index, arr) {
      if (memberToUpdate.uuid === member.uuid) {
          arr[index] = member;
      }
    });
    this.setState({family:family});
    localStorage.setItem('family', JSON.stringify(family));
  }

  getDescendantsOfUUID = (uuid) => {
    if(this.state.family){
      var filtered = this.state.family.filter(function(member){
        //console.log(member.parentUUID, uuid);
        return (member.parentUUID === uuid)
      });
      //console.log(filtered);
      return filtered;
    }else{
      return [];
    }
  }

  isMemberStranded = (member) =>{
    if(member.parentUUID === 0) return false;

    var family = JSON.parse(localStorage.getItem('family'));
    var stranded = true;
    family.forEach((check, idx, arr) =>{
      if(member.parentUUID === check.uuid) stranded = false;
    });
    return stranded;
  }

  clearStranded = () =>{
    var self = this;
    var family = JSON.parse(localStorage.getItem('family'));
    family.filter(function(member){
      console.log(member, self.isMemberStranded(member));
      return !self.isMemberStranded(member);
    });

    this.setState({family:family});
    localStorage.setItem('family', JSON.stringify(family));
  }

  removeFamilyMember = (uuid) =>{
    var filtered = this.state.family.filter(function(member){
      console.log(member, member.uuid, uuid);
      return member.uuid !== uuid;
    });
    console.log(filtered);
    this.setState({family:filtered});
    localStorage.setItem('family', JSON.stringify(filtered));
    this.clearStranded();
  }

  render() {

    return (
          <div>
            <AddFamilyMemberButton onClick={this.addNewRootFamilyMember}/>
            <div className="tree">
              <ul>
                {this.getDescendantsOfUUID(0).map(member=>{
                  return <FamilyMember
                          key={member.key}
                          member={member}
                          getDescendantsOfUUID={this.getDescendantsOfUUID}
                          onUpdate={this.updateFamilyMember}
                          onAdd={this.addFamilyMember}
                          onRemove={this.removeFamilyMember}
                          descendants={this.getDescendantsOfUUID(member.uuid)}
                  />
                })}
              </ul>
            </div>
        </div>

    );
  }
}

/**
  Individual Member Node.
  Can edit member
  Can add child
**/
class FamilyMember extends Component {

  constructor(props){
    super(props);
    this.state = {
      dialogVisible: false
    }
  }

  showDialog = (e) =>{
    e.preventDefault();
    e.stopPropagation();
    this.setState({dialogVisible: true});
  }

  hideDialog = () =>{
    this.setState({dialogVisible: false});
  }

  remove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("removing member with uuid: ",this.props.member.uuid)
    this.props.onRemove(this.props.member.uuid);
  }

  addDescendant = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("adding new descendant for uuid: ",this.props.member.uuid)
    const member = {
      firstName: "",
      lastName: "",
      parentUUID: this.props.member.uuid
    }
    this.props.onAdd(member);
  }

  render() {
    return (
  			<li>
  				<a
            href="#childnode"
            onClick={this.showDialog}
          >
            <div>
              <p>FirstName: {this.props.member.firstName}</p>
              <p>LastName: {this.props.member.lastName}</p>
              <Button onClick={this.addDescendant} bsSize="sm" bsClass="btn btn-primary btn-circle-sm"><i className="glyphicon glyphicon-user"></i></Button>
              <Button onClick={this.remove} bsSize="sm" bsClass="btn btn-danger btn-circle-sm"><i className="glyphicon glyphicon-trash"></i></Button>
            </div>
          </a>
          <FamilyMemberDescendants
            descendants={this.props.descendants}
            getDescendantsOfUUID={this.props.getDescendantsOfUUID}
            onAdd={this.props.onAdd}
            onUpdate={this.props.onUpdate}
            onRemove={this.props.onRemove}
          />
          <AddDescendantDialog
            dialogVisible={this.state.dialogVisible}
            onSave={this.props.onUpdate}
            showDialog={this.showDialog}
            hideDialog={this.hideDialog}
            member={this.props.member}
          />
  			</li>
    );
  }
}

/**
  Container to hold member descendants
**/
class FamilyMemberDescendants extends Component {

  render() {
    return (
      (
        this.props.descendants &&
        this.props.descendants.length>0
      )?
      <ul>
            {this.props.descendants.map(member=>
              <FamilyMember
                  key={member.key}
                  member={member}
                  parentUUID={member.parentUUID}
                  getDescendantsOfUUID={this.props.getDescendantsOfUUID}
                  descendants={this.props.getDescendantsOfUUID(member.uuid)}
                  onAdd={this.props.onAdd}
                  onUpdate={this.props.onUpdate}
                  onRemove={this.props.onRemove}
              />
            )}
      </ul>
      :null
    );
  }
}

/**
  Fucntional Component - make easier
  to create form elements
**/
const FieldGroup = ({ id, label, help, ...props }) => {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}

/**
  Each node has an associated widget it uses to add Descendants
**/
class AddDescendantDialog extends Component {

  constructor(props){
    super(props);
    this.state = {
      key: this.props.member.key,
      firstName: this.props.member.firstName,
      lastName: this.props.member.lastName,
      parentUUID: this.props.member.parentUUID,
      uuid: this.props.member.uuid
    };
  }

  handleFirstNameChange = (e) => {
    this.setState({ firstName: e.target.value });
  }

  handleLastNameChange = (e) => {
    this.setState({ lastName: e.target.value });
  }

  close = () => {
    this.props.hideDialog();
  }

  saveAndClose = () => {
    this.props.hideDialog();
    this.props.onSave({
      "key": this.state.key,
      "firstName" : this.state.firstName,
      "lastName" : this.state.lastName,
      "parentUUID" : this.state.parentUUID,
      "uuid": this.state.uuid
    })
  }

  render() {

    return (
      <div className="AddDescendantDialog">
        <Modal show={this.props.dialogVisible} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Add Family Member</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <FieldGroup
                id="firstName"
                type="text"
                label="First Name"
                value={this.state.firstName}
                placeholder="Enter First Name"
                onChange={this.handleFirstNameChange}
              />
              <FieldGroup
                id="lastName"
                type="text"
                label="Last Name"
                value={this.state.lastName}
                placeholder="Enter Last Name"
                onChange={this.handleLastNameChange}
              />
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" bsStyle="primary" onClick={this.saveAndClose}>Save and Close</Button>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export {FamilyContainer, AddDescendantDialog, FamilyMemberDescendants, FamilyMember };
