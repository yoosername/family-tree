import React, { Component } from 'react';
import './Family.css';
import { Button, Modal, ControlLabel, FormGroup, HelpBlock, FormControl } from 'react-bootstrap';
import uuidv4 from 'uuid/v4';

/*
  compare search object to family member on 1 or more keys
*/
function memberMatches(member, searchObj) {
    for(var key in searchObj) {
        if(searchObj[key] !== member[key]) {
            return false;
        }
    }
    return true;
}

// TODO: Clicking on a member should be edit mode for the member
// TODO: Adding member should create member with default values
//       and auto enter edit mode

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
          //console.log("from start");
        const uuid = uuidv4();
        this.state = {
          family: [
            {
              key:uuid,
              firstName:"Adam&Eve",
              lastName:"(click to add children)",
              uuid:uuid,
              parentUUID:0
            }
          ]
        };
      }

  }

  addFamilyMember = (member) =>{
    //console.log("adding new family member: ", member);
    var latest = this.state.family.slice();
    latest.push(member)
    this.setState({family:latest});
    localStorage.setItem('family', JSON.stringify(latest));
  }

  getFamilyMembersWithUUID = (uuid) => {
    var filtered = this.state.family.filter(function(member){
      return (member.uuid === uuid)
    });
    return filtered;
  }

  getDescendantsOfUUID = (uuid) => {
    var filtered = this.state.family.filter(function(member){
      //console.log(member.parentUUID, uuid);
      return (member.parentUUID === uuid)
    });
    //console.log(filtered);
    return filtered;
  }

  removeFamilyMembers = (member, test) =>{
    //console.log("removing family members matching: ", member);
    var orig = this.state.family.slice();
    var filtered = orig.filter(function(member){
      return (!memberMatches(member, test))
    });
    this.setState({family:filtered});
    localStorage.setItem('family', JSON.stringify(this.state));
  }

  render() {

    return (

          <div className="tree">
            <ul>
              {this.getDescendantsOfUUID(0).map(rootNode=>{
                return <FamilyMember
                        key={rootNode.uuid}
                        firstName={rootNode.firstName}
                        lastName={rootNode.lastName}
                        uuid={rootNode.uuid}
                        parentUUID={rootNode.parentUUID}
                        getDescendantsOfUUID={this.getDescendantsOfUUID}
                        onAddDescendantAction={this.addFamilyMember}
                        descendants={this.getDescendantsOfUUID(rootNode.uuid)}
                />
              })}
            </ul>
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

  showDialog = () =>{
    this.setState({dialogVisible: true});
  }

  hideDialog = () =>{
    this.setState({dialogVisible: false});
  }

  addDescendant = (member) => {
    console.log("adding",member, "to", this.props.uuid)
    member.parentUUID = this.props.uuid;
    this.props.onAddDescendantAction(member);
  }

  render() {
    return (
  			<li>
  				<a
            href="#childnode"
            onClick={this.showDialog}
          >
            <div>
              <p>FirstName: {this.props.firstName}</p>
              <p>LastName: {this.props.lastName}</p>
            </div>
          </a>
          <FamilyMemberDescendants
            descendants={this.props.descendants}
            getDescendantsOfUUID={this.props.getDescendantsOfUUID}
            onAddDescendantAction={this.props.onAddDescendantAction}
          />
          <AddDescendantDialog
            dialogVisible={this.state.dialogVisible}
            onSave={this.addDescendant}
            showDialog={this.showDialog}
            hideDialog={this.hideDialog}
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
                  key={member.uuid}
                  firstName={member.firstName}
                  lastName={member.lastName}
                  uuid={member.uuid}
                  parentUUID={member.parentUUID}
                  getDescendantsOfUUID={this.props.getDescendantsOfUUID}
                  descendants={this.props.getDescendantsOfUUID(member.uuid)}
                  onAddDescendantAction={this.props.onAddDescendantAction}
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
    const uuid = uuidv4();
    this.state = {
      key: uuid,
      firstName: "",
      lastName: "",
      uuid: uuid
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
      "uuid": this.state.uuid
    })
    // Reset the panel
    const uuid = uuidv4();
    this.setState({
      key: uuid,
      firstName: "",
      lastName: "",
      uuid: uuid
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
