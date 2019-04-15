import React from "react"
import PropTypes from "prop-types"
import {Im,fromJS,} from "immutable"
import Select from "react-select"
import { isImmutable } from "../core/utils"
var _ = require("lodash")

const SWAGGER2_OPERATION_METHODS = [
  "get", "put", "post", "delete", "options", "head", "patch"
]

const OAS3_OPERATION_METHODS = SWAGGER2_OPERATION_METHODS.concat(["trace"])

const styles = {
  commonFlex:{
    display:"flex",alignItems:"center", justifyContent: "center",flexDirection:"column",flex:1,width:"100%"
  }
}

export default class Operations extends React.Component {


  static propTypes = {
    specSelectors: PropTypes.object.isRequired,
    specActions: PropTypes.object.isRequired,
    oas3Actions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    layoutSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
    authSelectors: PropTypes.object.isRequired,
    getConfigs: PropTypes.func.isRequired,
    fn: PropTypes.func.isRequired,
    handleFilterMethod:PropTypes.func,
    handleFilterTag:PropTypes.func,
    filterTag:PropTypes.string
  };

  constructor(props, context) {
    super(props, context)
    this.state = {
      selectedVer:undefined,
      selectedDev:undefined,
      selectedMethod:undefined,
      developerList:[],
      verList:[],
      methodList:[],
      filterVersion:"",
      filterDev:"",
      filterSearch:""
    }

  }
  componentDidMount () {

    this.buildList(this.props.specSelectors.taggedOperations())
  }

  buildList(taggedOps){

    taggedOps = isImmutable(taggedOps)?taggedOps.toJS():taggedOps
    var verList = []
    var developerList = []
    var methodList = []
    _.each(taggedOps,(item,index) => {
      if(item.tagDetails && item.tagDetails.description){
        verList.push(item.tagDetails.description)
      }
      if(item.tagDetails && item.tagDetails.externalDocs && item.tagDetails.externalDocs.description){
        developerList.push(item.tagDetails.externalDocs.description)
      }
      if(item.operations && item.operations.length > 0){
        _.each(item.operations,(iitem,iindex) =>{
          methodList.push(iitem.method)
        })
      }
    })
    verList = _.uniq(verList)
    developerList = _.uniq(developerList)
    methodList = _.uniq(methodList)

    for(let i in verList){
      let value = verList[i]
      verList[i] = {label:value,value:value}
    }
    for(let i in developerList){
      let value = developerList[i]
      developerList[i] = {label:value,value:value}
    }
    for(let i in methodList){
      let value = methodList[i]
      methodList[i] = {label:value,value:value}
    }
    verList.unshift({label:"全部版本",value:"全部版本"})
    developerList.unshift({label:"全部开发人",value:"全部开发人"})
    methodList.unshift({label:"全部方法",value:"全部方法"})
    this.setState({
      verList:verList,
      developerList:developerList,
      methodList:methodList
    })



  }
  handleChange(event){
    this.setState({
      filterSearch:event.target.value
    })
  }
  handleSelectVer(selectedOption){
    this.setState({
      selectedVer:selectedOption
    })
    if(selectedOption.value === "全部版本"){
      this.setState({
        filterVersion:""
      })
    }else{
      this.setState({
        filterVersion:selectedOption.value
      })
    }
  }
  handleSelectDev(selectedOption){
    this.setState({
      selectedDev:selectedOption
    })
    if(selectedOption.value === "全部开发人"){
      this.setState({
        filterDev:""
      })
    }else{
      this.setState({
        filterDev:selectedOption.value
      })
    }
  }
  handleSelectMethod(selectedOption) {
    this.setState({
      selectedMethod: selectedOption
    })
    selectedOption = selectedOption.value === "全部方法" ? "" : selectedOption.value
    this.props.handleFilterMethod(selectedOption)
  }

  render () {

    let {
      specSelectors,
      getComponent,
      layoutSelectors,
      layoutActions,
      getConfigs,
      fn,
    } = this.props

    let taggedOps = specSelectors.taggedOperations()

    const rawSchemaValue = specSelectors.specJson()


    const OperationContainer = getComponent("OperationContainer", true)
    const OperationTag = getComponent("standalone_operationTag")

    let {
      maxDisplayedTags,
    } = getConfigs()

    let filter = layoutSelectors.currentFilter()

    if (filter) {
      if (filter !== true) {
        taggedOps = fn.opsFilter(taggedOps, filter)
      }
    }

    if (maxDisplayedTags && !isNaN(maxDisplayedTags) && maxDisplayedTags >= 0) {
      taggedOps = taggedOps.slice(0, maxDisplayedTags)
    }
    const tags = Object.keys(taggedOps.toJS()) || []

    return (
      <div style={styles.commonFlex}>
        <div style={styles.commonFlex}>
          <input type={"search"} style={{ width: "100%", height: "35px" }} value={this.state.filterSearch} onChange={this.handleChange.bind(this)}></input>
        </div>
        <div style={{display:"flex",flexDirection:"row",marginTop:"5px",flex:"1",width:"100%"}}>
          <div style={{flex:"1"}}>
            <Select
              defaultValue={{label:"全部版本",value:"全部版本"}}
              value={this.state.selectedVer}
              isLoading={false}
              isClearable={false}
              isSearchable={false}
              onChange={e=>{
                this.handleSelectVer(e)
              }}
              options={this.state.verList}
            />
          </div>
          <div style={{flex:"1"}}>
            <Select
              defaultValue={{label:"全部开发人",value:"全部开发人"}}
              value={this.state.selectedDev}
              isLoading={false}
              isClearable={false}
              isSearchable={false}
              onChange={e=>{
                this.handleSelectDev(e)
              }}
              options={this.state.developerList}
            />
          </div>
          <div style={{flex:"1"}}>
            <Select
              defaultValue={{label:"全部方法",value:"全部方法"}}
              value={this.state.selectedMethod}
              isLoading={false}
              isClearable={false}
              isSearchable={false}
              onChange={e => {
                this.handleSelectMethod(e)
              }}
              options={this.state.methodList}
            />
          </div>

        </div>
        <div style={{ flex: 5 ,marginTop:"10px",paddingLeft:"5px",width:"100%"}}>
          {
            taggedOps.map( (tagObj, tag) => {
              return (
                <OperationTag
                  key={"operation-" + tag}
                  tagObj={tagObj}
                  tag={tag}
                  tags={tags}
                  filterTag={this.props.filterTag}
                  filterVersion={this.state.filterVersion}
                  filterDev={this.state.filterDev}
                  filterSearch={this.state.filterSearch}
                  handleFilterTag={this.props.handleFilterTag}
                  layoutSelectors={layoutSelectors}
                  layoutActions={layoutActions}
                  getConfigs={getConfigs}
                  getComponent={getComponent}>
                </OperationTag>
              )
            }).toArray()
          }
        </div>
      </div>
    )
  }

}



Operations.propTypes = {

}
