import React, { Component } from 'react';
import './Family.css';
import { Button, Modal, ControlLabel, FormGroup, HelpBlock, FormControl } from 'react-bootstrap';
import uuidv4 from 'uuid/v4';

/**
  Start with a single empty root node.
  Each Node can be edited and
  handles ability to add descendents
**/
class FamilyContainer extends Component {

  render() {

    var uuid = uuidv4();

    return (

          <div className="tree">
            <ul>
              <FamilyMember
                      key={uuid}
                      firstName="Adam&Eve"
                      lastName="(click to add children)"
                      uuid={uuid}
              />
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
      firstName:this.props.firstName,
      lastName:this.props.lastName,
      uuid:(this.props.uuid)?this.props.uuid:uuidv4(),
      descendants:(this.props.descendants)?this.props.descendants:[],
      dialogVisible: false
    }
  }

  addDescendant = (descendant) =>{
    console.log("adding: ", descendant);
    var latest = this.state.descendants.slice();
    latest.push(
      <FamilyMember
          key={descendant.uuid}
          firstName={descendant.firstName}
          lastName={descendant.lastName}
          uuid={descendant.uuid}
      />
    )
    this.setState({descendants:latest});
  }

  showDialog = () =>{
    this.setState({dialogVisible: true});
  }

  hideDialog = () =>{
    this.setState({dialogVisible: false});
  }

  render() {
    return (
  			<li>
  				<a
            href="#childnode"
            onClick={this.showDialog}
          >
            <div>
              <p>FirstName: {this.state.firstName}</p>
              <p>LastName: {this.state.lastName}</p>
            </div>
          </a>
          <FamilyMemberDescendants
            descendants={this.state.descendants}
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
            {this.props.descendants}
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
      firstName: "",
      lastName: "",
      uuid: uuidv4()
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
      "firstName" : this.state.firstName,
      "lastName" : this.state.lastName,
      "uuid": this.state.uuid
    })
    this.setState({
      firstName: "",
      lastName: "",
      uuid: uuidv4()
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
