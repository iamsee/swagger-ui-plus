import React from "react"
import PropTypes from "prop-types"
import ImPropTypes from "react-immutable-proptypes"
import Im from "immutable"
import { createDeepLinkPath, escapeDeepLinkPath, sanitizeUrl } from "core/utils"

export default class OperationTag extends React.Component {

  static defaultProps = {
    tagObj: Im.fromJS({}),
    tag: "",
  }

  static propTypes = {
    tagObj: ImPropTypes.map.isRequired,
    tag: PropTypes.string.isRequired,

    layoutSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired,

    getConfigs: PropTypes.func.isRequired,
    getComponent: PropTypes.func.isRequired,

    children: PropTypes.element,
    handleFilterTag: PropTypes.func,
    filterTag: PropTypes.string,
    filterVersion: PropTypes.string,
    filterDev: PropTypes.string,
    filterSearch: PropTypes.string,
  }

  render() {
    const {
      tagObj,
      tag,
      tags,
      children,

      layoutSelectors,
      layoutActions,
      getConfigs,
      getComponent,
    } = this.props

    let {
      docExpansion,
      deepLinking,
    } = getConfigs()

    const isDeepLinkingEnabled = deepLinking && deepLinking !== "false"

    const Collapse = getComponent("Collapse")
    const Markdown = getComponent("Markdown")
    const DeepLink = getComponent("DeepLink")
    const Link = getComponent("Link")

    let tagDescription = tagObj.getIn(["tagDetails", "description"], null)
    let tagExternalDocsDescription = tagObj.getIn(["tagDetails", "externalDocs", "description"])
    let tagExternalDocsUrl = tagObj.getIn(["tagDetails", "externalDocs", "url"])

    let isShownKey = ["operations-tag", tag]
    let showTag = layoutSelectors.isShown(isShownKey, docExpansion === "full" || docExpansion === "list")

    const styles = {
      itemStyle:{
        height:"50px",
        overflow:"hidden"
      },
      listItemStyle1:{
        fontSize: "28px",
        fontWeight: "600",
        flex: 1,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start"
      },
      listItemStyle2:{
        fontSize: "12px", fontWeight: "400", flex: 1, display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start"
      },
      listItemStyle3:{
        fontSize: "12px", fontWeight: "400", flex: 1, display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start"
      },

    }
    if(this.props.filterVersion !== "" && this.props.filterVersion !== tagDescription){
      return null
    }
    if(this.props.filterDev !== "" && this.props.filterDev !== tagExternalDocsDescription){
      return null
    }
    if(this.props.filterSearch !== "" && tag.toLowerCase().indexOf(this.props.filterSearch.toLowerCase()) === -1){
      return null
    }
    return (

      <div className={showTag ? "opblock-tag-section is-open" : "opblock-tag-section"} style={{height:"45px",overflow:"hidden",padding:0,backgroundColor:this.props.filterTag === tag ?"RGBA(26, 26, 26, 0.3)":""}}>

        <div
          onClick={() => {
            for(let tag of tags){
              layoutActions.show(["operations-tag",tag], false)
            }
            layoutActions.show(isShownKey, true)
            if(isShownKey.length === 2){
              this.props.handleFilterTag(isShownKey[1])
            }else{
              this.props.handleFilterTag("")
            }
          }}
          className={!tagDescription ? "opblock-tag no-desc" : "opblock-tag"}
          id={isShownKey.map(v => escapeDeepLinkPath(v)).join("-")}
          data-tag={tag}
          data-is-open={showTag}
          style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" ,padding:0,margin:0,paddingLeft:"5px",borderBottomWidth:"1px",borderBottomColor:"RGBA(26, 26, 26, 0.1)"}}
        >
          <div style={styles.listItemStyle1}>
            {tag}
          </div>
          <div style={styles.listItemStyle2}>
            {tagDescription}
          </div>
          <div style={styles.listItemStyle3}>
            {tagExternalDocsDescription}
          </div>

          {/*<button*/}
          {/*  className="expand-operation"*/}
          {/*  title={showTag ? "Collapse operation" : "Expand operation"}*/}
          {/*  onClick={() => layoutActions.show(isShownKey, !showTag)}>*/}

          {/*  <svg className="arrow" width="20" height="20">*/}
          {/*    <use href={showTag ? "#large-arrow-down" : "#large-arrow"}*/}
          {/*         xlinkHref={showTag ? "#large-arrow-down" : "#large-arrow"}/>*/}
          {/*  </svg>*/}
          {/*</button>*/}
        </div>

        <Collapse isOpened={showTag}>
          {children}
        </Collapse>
      </div>
    )
  }
}
