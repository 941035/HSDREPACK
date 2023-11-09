sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,JSONModel,MessageBox) {
        "use strict";

        return Controller.extend("com.parker.zhsdrepack.controller.MainView", {
            onInit: function () {
                this.oDataModel = this.getOwnerComponent().getModel();
            },
            showPartNumberValueHelp: function(){
                var that = this;
                this._valueHelpDialog = null;
			    this._valueHelpDialog = sap.ui.xmlfragment(
				"com.parker.zhsdrepack.view.PartNumber",
				this
			);
    
			this.getView().addDependent(this._valueHelpDialog);
			// sap.ui.getCore().byId("idSearchPrinter").setModel(this.oDataModel, "PrinterModel");
            this.oDataModel.read("/Mat0mSet", {
				
				success: function (oData) {
					console.log(oData);
                    var dataModel = new JSONModel();
                    dataModel.setData({
                        PartNumberModelSet: oData.results
                    });
                    sap.ui.getCore().byId("partNumTable").setModel(dataModel, "PartNumberModel")
                    that._valueHelpDialog.open();

				},
				error: function (oError) {
					console.log(oError);

				}
			});
            },
            onPressOkButton: function(oEvent){
                this.selectedPartNumber= sap.ui.getCore().byId("partNumTable").getSelectedItem().getAggregation("cells")[0].getProperty("text")
                this.getView().byId("inpPartNumber").setValue(this.selectedPartNumber);
                if (this._valueHelpDialog) {
                    this._valueHelpDialog.destroy(true);
                    this._valueHelpDialog = null;
                }
            },
            onPrint: function(){
                this.getView().byId("setPrinterbtn").setText("Re-Print");
                this.getView().byId("printingDetailsForm").setVisible(true);
            },
            onPressCancelButton: function(oEvent){
                if (this._valueHelpDialog) {
                    this._valueHelpDialog.destroy(true);
                    this._valueHelpDialog = null;
                }
            },
            onRestart: function(){
                this.getView().byId("repackingDetailsForm").setVisible(false);
                this.getView().byId("printingDetailsForm").setVisible(false);
                this.getView().byId("crtWarehousebtn").setVisible(false);
                this.getView().byId("setPrinterbtn").setVisible(false);
                this.getView().byId("inpPartNumber").setValue("");
                this.getView().byId("inpQty").setValue("");
                this.getView().byId("inpBatch").setValue("");
                this.getView().byId("inpDelivery").setValue("");
                this.getView().byId("setRestart").setVisible(false);
                this.getView().byId("setPrinterbtn").setText("Print");
            },
            onCreateWareHouseTask: function(){
                this.payloadData.Refdoc = this.getView().byId("inpDelivery").getValue();
                this.oDataModel.create("/RepackInstructionsSet", this.payloadData, {

                    success: function (oData) {
                        MessageBox.success(oData.Message);

                    },
                    error: function (oError) {
                        console.log("error");
                        MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                    }
                });
            },
            checkMandatoryField: function(){
                this.bflag = false;
                var partNumber = this.getView().byId("inpPartNumber").getValue();
                var deliveryNumber = this.getView().byId("inpDelivery").getValue();

                if((partNumber === "") || (deliveryNumber === "")){
                    MessageBox.error("Kindly Enter Part Number or Delivery Number");
                    this.bflag = true;
                }
                
            },
            onExecutePress: function(){
                var that = this;
                this.checkMandatoryField();
                this.payloadData={};
                this.partNumber= this.getView().byId("inpPartNumber").getValue();
                this.qty = this.getView().byId("inpQty").getValue();
                this.Refdoc = this.getView().byId("inpDelivery").getValue();
                if(!(this.bflag)){
                this.oDataModel.read("/RepackInstructionsSet(Matnr='"+ this.partNumber +"',Refdoc='"+ this.Refdoc + "')", {
				
                    success: function (oData) {
                        console.log(oData);
                        that.payloadData = oData;
                        var rePackModel = new JSONModel();
                        rePackModel.setData(oData);
                        that.getView().byId("repackingDetailsForm").setModel(rePackModel,"rePackModel");
                        that.getView().byId("printingDetailsForm").setModel(rePackModel,"rePackModel");
                        that.getView().byId("deliveryDetailsForm").setModel(rePackModel,"rePackModel");
                        that.getView().byId("setRestart").setVisible(true);
                       if(oData.Message === "No Special Packaging Instructions Exist for this Part"){
                        sap.m.MessageToast.show(oData.Message);
                        that.getView().byId("repackingDetailsForm").setVisible(true);
                        // that.getView().byId("printingDetailsForm").setVisible(true);
                        that.getView().byId("setPrinterbtn").setVisible(true);
                        that.getView().byId("crtWarehousebtn").setVisible(true);
                       }
                       else{
                           that.getView().byId("repackingDetailsForm").setVisible(true);
                           that.getView().byId("setPrinterbtn").setVisible(true);
                           that.getView().byId("crtWarehousebtn").setVisible(true);
                       }
    
                    },
                    error: function (oError) {
                        console.log(oError);
    
                    }
                });
            }
            }
        });
    });
