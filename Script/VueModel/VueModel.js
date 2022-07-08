/**
 *  VueModel.js v1.9.9d
 *  From Rugal Tu
 *  Based on Vue.js v2.6.12、jQuery Library v3.5.1
 * */


class VueModel {
    constructor(_Url, _PageData = {}, _VueOptions = {}, _ElementName = '#PageContent', IsMountedShow = true) {
        this._Vue;
        this._VueOptions = {};

        this.Token = undefined;
        this.Domain = undefined;
        this.ElementName = _ElementName = this.ToJQueryName(_ElementName, false);
        this.UrlKeyDic = {};
        this.UrlKeyDic[this.ElementName] = _Url;

        this.SubmitUrl = {};
        this.SubmitCheckColumnKeys = {};
        this.ColumnCHTName = {};

        this.MethodType = 'GET';
        this.VueResult = {
            Result: {},
            PageData: _PageData,
            FileResult: {},
            DomEventFunc: {},
            TempResult: {},
            ErrorResult: {},
        };
        this.OnSuccess = function (Result) { };
        this.SuccessBackPage = function () { };
        this.FileSuccessBackPage = function () { };
        this.OnError = function (Error) { };
        this.OnComplete = function () { };
        this.AjaxSuccessCheck = undefined;
        this.SubmitSuccessCheck = undefined;
        this.ErrorAlert = undefined;
        this.ErrorMute = {

        };
        this.GetToken = undefined;
        this.GlobalVueOption = undefined;

        this.IsMountedShow = IsMountedShow;
        this.IsDevelopment = false;

        this.OnCheckFalse = function (FalseColumn) { };
        this.InitOption(_VueOptions);
    }

    // #region Property
    get VueOptions() { return this._VueOptions; }
    set VueOptions(_VueOptions) {
        $.extend(this._VueOptions, _VueOptions);
        this.InitOption();
    }
    get Vue() { return this._Vue; }
    set Vue(SetVue) { this._Vue = SetVue; }
    get PageData() { return this.VueResult.PageData; }
    set PageData(SetPageData) { this.VueResult.PageData = SetPageData; }
    get Result() { return this.VueResult.Result; }
    set Result(SetResult) { this.VueResult.Result = SetResult; }
    get FileResult() { return this.VueResult.FileResult; }
    get DomEventFunc() { return this.VueResult.DomEventFunc; }
    get TempResult() { return this.VueResult.TempResult; }
    get ErrorResult() { return this.VueResult.ErrorResult; }
    set ErrorResult(_ErrorResult) { this.VueResult.ErrorResult = _ErrorResult; }
    // #endregion

    // #region Init Native Vue
    /**
     * 初始化 Vue 原生物件設定參數，並將指定 Option Extend 至初始設定
     * @param {any} _VueOptions
     */
    InitOption(_VueOptions) {

        try {
            if (Domain != undefined && this.Domain == undefined)
                this.Domain = Domain;
        } catch { }

        try {
            if (AjaxSuccessCheck != undefined)
                this.AjaxSuccessCheck = AjaxSuccessCheck;
        } catch { }

        try {
            if (SubmitSuccessCheck != undefined)
                this.SubmitSuccessCheck = SubmitSuccessCheck;
        } catch { }

        try {
            if (GetToken != undefined)
                this.GetToken = GetToken;
        } catch { }

        try {
            if (GlobalVueOption != undefined)
                this.GlobalVueOption = GlobalVueOption;
        } catch { }

        try {
            if (AddDevelopmentView == true)
                this.AddV_DevelopmentView();
        } catch { }

        let ElementName = this.ElementName;
        let IsMountedShow = this.IsMountedShow;
        let StaticOptions = {
            mounted() {
                if (IsMountedShow)
                    $(ElementName).show();
            },
        };

        $.extend(StaticOptions, _VueOptions);
        if ("mounted" in _VueOptions) {
            let UserMounted = _VueOptions.mounted;
            $.extend(StaticOptions, {
                mounted() {
                    UserMounted();
                    if (IsMountedShow)
                        $(ElementName).show();
                }
            });
        }

        let BindingOptions = {
            el: ElementName,
            data: this.VueResult,
        };
        $.extend(StaticOptions, BindingOptions);

        if (this.GlobalVueOption != undefined)
            $.extend(StaticOptions, this.GlobalVueOption);

        $.extend(this.VueOptions, StaticOptions);
        if ("methods" in this.VueOptions) {
            if (Object.keys(this.VueOptions.methods).length > 0)
                $.extend(this, this.VueOptions.methods);
        }

    }

    /**
     * 初始化 Vue 原生物件，並使用 VueOption 作為設定參數
     * */
    VueInit() {
        if (this.Vue == undefined)
            this.Vue = new Vue(this.VueOptions);

        return this;
    }

    VueRefresh() {
        this.Vue.$forceUpdate();
        return this;
    }

    // #endregion

    // #region Development

    AddV_DevelopmentView(DevelopmentDivId = undefined) {

        this.IsDevelopment = true;

        if (DevelopmentDivId == undefined) {
            DevelopmentDivId = '__VueModelResult__';
            let RootPage = $(this.ToJQueryName(this.ElementName));
            let AppendDiv = `<div id="${DevelopmentDivId}" class="row" style="font-size:18px"></div>`;
            RootPage.append(AppendDiv);
        }

        let DevelopmentDiv = $(this.ToJQueryName(DevelopmentDivId))[0];
        if (DevelopmentDiv != undefined) {
            DevelopmentDiv.innerHTML =
                `
                <div class="col col-auto">
                    <label style="background-color:black;color:white;">Vue Model Storage</label><br />
                    <div class="form-check">
                       <input id="__CheckboxDarkModel__" type="checkbox" class="form-check-input" checked v-on:change="DarkModelChange()"/>
                       <label class="form-check-label" style="background-color:black;color:white;" for="__CheckboxDarkModel__">Dark Mode</label>
                    </div>
                </div>

                <div class="col col-auto align-self-center">
                    <select id="__FindStorageKey__" class="form-select col col-auto">
                        <option value="VueResult">VueResult</option>
                        <option v-for="(Item, Idx) in Object.keys(JSON.parse( JSON.stringify(_data) ))" :value="Item">{{ Item }}</option>
                    </select>
                </div>
                
                <div class="col col-auto align-self-center">
                    <button id="__BtnOpenInput__" class="btn btn-success">Open Input</button>
                    <button style="display:none" id="__BtnCloseInput__" class="btn btn-warning">Close Input</button>
                    <button id="__BtnVueModelStorageInputSave__" class="btn btn-primary" style="display:none">Input Save</button>
                </div>

                <div class="col align-self-center d-flex justify-content-start">
                    <label class="align-self-center" style="font-size:18px; background-color:black; color:white">Font-Size</label>
                    <input id="__StorageFontSize__" v-on:change="FontSizeChange()" class="ms-1 form-control" style="width:80px" type="number" value="20"/>
                </div>

                <br />
                <textarea id="__VueModelOutput__" readonly style="width: 100%; height: 100%; margin-top: 10px;min-height:500px; background-color:black; color:white; font-size:20px"></textarea>`;

            this.AddFunction('StorageInputSave', () => this.StorageInputSave(), '__BtnVueModelStorageInputSave__');
            this.AddFunction('OpenInput', () => this.OnOpenInput(), '__BtnOpenInput__');
            this.AddFunction('CloseInput', () => this.OnCloseInput(), '__BtnCloseInput__');
            this.AddFunction('DarkModelChange', () => this.OnDarkModelChange());
            this.AddFunction('FontSizeChange', () => this.OnFontSizeChange());
            let Timer = () => setInterval(this.DevelopmentOutput, 100, this);
            Timer.call(this);
        }

        return this;
    }

    DevelopmentOutput(ShowVueModel) {
        let StorageKey = $('#__FindStorageKey__').val();
        let OutputJObj = $('#__VueModelOutput__');
        let InputSaveBtnJObj = $('#__BtnVueModelStorageInputSave__');

        if (InputSaveBtnJObj.is(":hidden")) {
            if (StorageKey != 'VueResult') {
                OutputJObj.val(JSON.stringify(ShowVueModel['VueResult'][StorageKey], null, 2));
            } else {
                OutputJObj.val(JSON.stringify(ShowVueModel[StorageKey], null, 2));
            }
        }
    }

    OnOpenInput() {
        $('#__BtnOpenInput__').hide();
        $('#__BtnCloseInput__').show();
        let OutputJObj = $('#__VueModelOutput__');
        let InputSaveBtnJObj = $('#__BtnVueModelStorageInputSave__');
        OutputJObj.attr('readonly', false);
        InputSaveBtnJObj.show();
    }

    OnCloseInput() {
        $('#__BtnOpenInput__').show();
        $('#__BtnCloseInput__').hide();
        let OutputJObj = $('#__VueModelOutput__');
        let InputSaveBtnJObj = $('#__BtnVueModelStorageInputSave__');
        OutputJObj.attr('readonly', true);
        InputSaveBtnJObj.hide();
    }

    OnDarkModelChange() {
        let IsChecked = $('#__CheckboxDarkModel__').prop('checked');
        if (IsChecked) {
            $('#__VueModelOutput__').css('background-color', 'black')
            $('#__VueModelOutput__').css('color', 'white')
        }
        else {
            $('#__VueModelOutput__').css('background-color', 'white')
            $('#__VueModelOutput__').css('color', 'black')
        }
    }

    OnFontSizeChange() {
        let GetSize = $('#__StorageFontSize__').val();
        $('#__VueModelOutput__').css('font-size', `${GetSize}px`);
    }

    StorageInputSave() {
        let GetConvertResult = $('#__VueModelOutput__').val();
        let GetResultJson = JSON.parse(GetConvertResult);
        let StorageKey = $('#__FindStorageKey__').val();
        if (StorageKey != 'VueResult') {
            this.VueResult[StorageKey] = GetResultJson;
        } else {
            let AllKey = Object.keys(GetResultJson);
            for (let i = 0; i < AllKey.length; i++) {
                let Key = AllKey[i];
                let Val = GetResultJson[Key];
                this.VueResult[Key] = Val;
            }
        }
        this.VueRefresh();
    }
    // #endregion

    // #region Add Url And Reset VueResult
    /**
     * 加入一個 Url : Key，寫入 UrlKeyDic[Key] 字典，並初始化 VueResult[Key] 存放區
     * @param {any} Key 不得為 undefined
     * @param {any} Url 不得為 undefined
     */
    AddVue(Key, Url) {
        this.UrlKeyDic[Key] = Url;
        Key = this.ToReplaceObjectId(Key);
        this.RCS_CreateResult(Key, this.VueResult);
        return this;
    }

    /**
     * 加入多個 Key : Url，使用 AddVue()
     * @param {any} UrlKeys 不得為 undefined
     */
    AddVueMult(KeyUrls = {}) {
        let ObjectKeys = Object.keys(KeyUrls);
        for (let Idx in ObjectKeys) {
            let GetKey = ObjectKeys[Idx];
            let GetUrl = KeyUrls[GetKey];
            this.AddVue(GetKey, GetUrl);
        }
        return this;
    }

    AddDomain(_Domain) {
        this.Domain = _Domain;
        return this;
    }

    AddSuccessCheck_Ajax(CheckFunc = (Result) => true) {
        this.AjaxSuccessCheck = CheckFunc;
        return this;
    }
    AddSuccessCheck_Submit(CheckFunc = (Result) => true) {
        this.SubmitSuccessCheck = CheckFunc;
        return this;
    }

    AddRequestErrorEnable(Key, IsEnable = false) {
        this.ErrorMute[Key] = IsEnable;
        return this;
    }

    AddErrorAlert_Submit(AlertFunc = (Error) => { }) {
        this.ErrorAlert = AlertFunc;
        return this;
    }
    // #endregion

    // #region Add For Submit
    /**
     * 加入一個 Key : Url，寫入 SubmitUrl[Key] 字典
     * @param {any} Key 若為 undefined 則使用 ElementName 作為 Key 值
     * @param {any} Url 不得為 undefined
     * @param {any} OnSuccess
     * @param {any} OnError
     * @param {any} OnComplate
     */
    AddSubmit(Key, Url, OnSuccess = undefined, OnError = undefined, OnComplate = undefined) {
        Key = this.CheckKey(Key);
        this.SubmitUrl[Key] = {
            Url: Url,
            OnSuccess: OnSuccess,
            OnError: OnError,
            OnComplate: OnComplate,
        };
        return this;
    }

    /**
     * 加入 'Submit()' 前檢核欄位
     * @param {any} Key 不得為 undefined
     * @param {any} CheckColumns { ColumnName: ColumnDisplay }
     * @param {any} OnCheckFalse (FalseColumn) => { } ，若為 undefined 則會呼叫 Alert(FalseColumn)
     */
    AddSubmit_CheckColumn(Key, CheckColumns, OnCheckFalse = undefined) {
        Key ??= this.ElementName;
        this.SubmitCheckColumnKeys[Key] = CheckColumns;
        OnCheckFalse ??= (FalseColumn) => alert(`"${FalseColumn}" 不得為空`);
        this.OnCheckFalse = OnCheckFalse;
        return this;
    }

    /**
     * 加入 'Submit()' 成功後返回頁面
     * @param {any} Action 不得為 undefined
     * @param {any} Controller 
     * @param {any} Domain
     */
    AddSubmit_SuccessBackPage(Action, Controller = undefined, Domain = undefined) {
        this.SuccessBackPage = () => this.ToUrl(Action, Controller, Domain);
        return this;
    }
    AddSubmit_File_SuccessBackPage(Action, Controller = undefined, Domain = undefined) {
        this.FileSuccessBackPage = () => this.ToUrl(Action, Controller, Domain);
        return this;
    }
    // #endregion

    // #region Add Function to VueResult

    /**
     * 加入一個 Function 至 VueResult[Key] 存放區
     * @param {any} Key 不得為 undefined
     * @param {any} Result 不得為 undefined
     * @param {any} ObjectId 若不為 undefined 則會新增 v-on:On{Key}{EventName} 事件至該 DOM 物件
     * @param {any} EventName 指定 v-on 事件屬性，預設為 click
     */
    AddFunction(Key, Result, ObjectId = undefined, EventName = 'click') {
        if (Key != undefined && Result != undefined)
            this.VueResult[Key] = Result;

        if (ObjectId != undefined && EventName != undefined) {
            ObjectId = this.ToJQueryName(ObjectId);
            this.AddV_On(ObjectId, EventName, `${Key}()`);
        }
        return this;
    }
    // #endregion

    // #region Add Vue Property To DOM Object

    /**
     * 將 'v-model' Vue屬性加入至 ObjectId DOM
     * @param {any} ObjectId 不得為 undefined
     * @param {any} ResultKey 若為 undefined 則使用 Result 作為 Key 值
     */
    AddV_Model(ObjectId, ResultKey = undefined, IsNumber = false) {
        ResultKey ??= ObjectId;
        ResultKey = this.ConvertResultKey(ResultKey);
        let ReplaceKey = this.ToReplaceObjectId(ResultKey);
        ObjectId = this.ToJQueryName(ObjectId);
        let JObj = $(ObjectId);
        let VModelAttr = IsNumber ? 'v-model.number' : 'v-model';
        JObj.attr(VModelAttr, ReplaceKey);

        return this;
    }

    AddV_ModelMult(ObjectIdKey = {}, KeyFor = undefined) {

        let AllKeys = Object.keys(ObjectIdKey);
        for (let Idx in AllKeys) {
            let GetKey = AllKeys[Idx];
            let GetVal = ObjectIdKey[GetKey];

            KeyFor ??= 'Result';
            if (typeof GetVal != "string" && KeyFor != undefined)
                GetVal = `${KeyFor}.${GetKey}`;
            else if (typeof GetVal === "string" && GetVal == '')
                GetVal = `${KeyFor}.${GetKey}`;
            else if (typeof GetVal === "string" && !GetVal.toString().includes('.') && KeyFor != undefined)
                GetVal = `${KeyFor}.${GetVal}`;

            this.AddV_Model(GetKey, GetVal);
        }
        return this;
    }

    /**
     * 將 'v-text' Vue屬性加入至 ObjectId DOM
     * @param {any} ObjectId 不得為 undefined
     * @param {any} Key 若為 undefined 則使用 Result 作為 Key 值
     */
    AddV_Text(ObjectId, Key = undefined, Format = undefined) {

        let ReplaceId = this.ToReplaceObjectId(ObjectId);
        Key ??= `Result.${ReplaceId}`;

        Key = this.ToReplaceObjectId(Key);
        if (Format != undefined)
            Key = `$options.filters.${Format}(${Key})`;
        ObjectId = this.ToJQueryName(ObjectId);
        $(ObjectId).attr('v-text', Key);
        return this;
    }

    /**
     * 將多個 'v-text' Vue屬性加入至 ObjectId DOM，並指定參數物件 KeyFor
     * @param {any} ObjectIdKey { ObjectId : Key } 不得為 undefined
     * @param {any} KeyFor 若為 undefined 則使用 Result 作為 KeyFor 值
     */
    AddV_TextMult(ObjectIdKey = {}, KeyFor = undefined, Format = undefined) {
        let AllKeys = Object.keys(ObjectIdKey);
        for (let Idx in AllKeys) {
            let ObjectId = AllKeys[Idx];
            let GetVal = ObjectIdKey[ObjectId];
            let GetKey = AllKeys[Idx].replaceAll('_', '');

            KeyFor ??= 'Result';
            if (typeof GetVal != "string" && KeyFor != undefined)
                GetVal = `${KeyFor}.${GetKey}`;
            else if (typeof GetVal === "string" && GetVal == '')
                GetVal = `${KeyFor}.${GetKey}`;
            else if (typeof GetVal === "string" && !GetVal.toString().includes('.') && KeyFor != undefined)
                GetVal = `${KeyFor}.${GetVal}`;

            this.AddV_Text(ObjectId, GetVal, Format);
        }
        return this;
    }

    /**
     * 將 'v-on:{EventName}' Vue屬性加入至 ObjectId DOM
     * @param {any} ObjectId 不得為 undefined
     * @param {any} EventName 不得為 undefined
     * @param {any} Key 可為 undefined
     * @param {any} Result 若不為 undefined 則放入 VueResult[Key] 存放區
     */
    AddV_On(ObjectId, EventName, Key = undefined, Result = undefined) {

        let ReplaceObjectId = ObjectId.replaceAll('.', '');
        Key ??= `On${ReplaceObjectId}${EventName}`;

        if (Key.substr(Key.length - 2, 2) == '()')
            Key = Key.substr(0, Key.length - 2);

        this.AddV_On_Base(ObjectId, EventName, Key, Result);
        return this;
    }

    AddV_On_Change(ObjectId, ChangeEvent) {
        let EventFuncKey = 'OnChangeEvent';
        this.PushDomEvent(ObjectId, EventFuncKey, ChangeEvent);
        this.AddV_On(ObjectId, 'change', undefined, (Arg) => {
            this.OnDomEvent(ObjectId, EventFuncKey, Arg);
        });
        return this;
    }

    AddV_On_Base(ObjectId, EventName, Key = undefined, Result = undefined) {

        let ReplaceObjectId = ObjectId.replaceAll('.', '');
        Key ??= `On${ReplaceObjectId}${EventName}`;
        ObjectId = this.ToJQueryName(ObjectId);
        $(ObjectId).attr(`v-on:${EventName}`, Key);
        if (Result != undefined)
            this.VueResult[Key] = Result;

        return this;
    }

    /**
     * 將 'v-bind:{BindName}' Vue屬性加入至 ObjectId DOM
     * @param {any} ObjectId 不得為 undefined
     * @param {any} BindName 不得為 undefined
     * @param {any} BindKey 若為 undefined 則使用 Result.{ObjectId} 作為 Key 值
     */
    AddV_Bind(ObjectId, BindName, BindKey = undefined) {
        let ReplaceId = this.ToReplaceObjectId(ObjectId);
        BindKey ??= `Result.${ReplaceId}`;
        let JObj = this.ToJQueryObject(ObjectId);
        JObj.attr(`v-bind:${BindName}`, BindKey);
        return this;
    }

    AddV_BindMult(BindName, ObjectIdBindKey = {}, DefaultBindKey = undefined) {
        let AllKey = Object.keys(ObjectIdBindKey);
        for (let Idx in AllKey) {
            let ObjectId = AllKey[Idx];
            let BindKey = ObjectIdBindKey[ObjectId];
            if (typeof BindKey === 'string')
                this.AddV_Bind(ObjectId, BindName, BindKey);
            else
                this.AddV_Bind(ObjectId, BindName, DefaultBindKey);
        }
        return this;
    }

    AddV_BindUrl(ObjectId, BindName, Url, UrlParam = undefined, IsConvertUrl = true) {

        if (UrlParam != undefined)
            UrlParam = this.ConvertUrlParam(UrlParam);

        if (IsConvertUrl)
            Url = this.ConvertToUrl(Url);

        let FullUrl = `${Url}`;
        if (UrlParam != undefined)
            FullUrl += `?${UrlParam}`;

        this.AddV_Bind(ObjectId, BindName, `'${FullUrl}'`);
        return this;
    }

    /**
     * 將 'v-for:{ForKey} in {Key}' Vue屬性加入至 ObjectId DOM
     * @param {any} ObjectId 不得為 undefined
     * @param {any} Key 若為 undefined 則使用 Result.{ObjectId} 作為 Key 值
     * @param {any} ForKey  若為 undefined 則使用 Item 作為 ForKey 值
     */
    AddV_For(ObjectId, Key = undefined, ForKey = undefined) {
        let JQueryId = this.ToJQueryName(ObjectId);
        let ReplaceId = this.ToReplaceObjectId(ObjectId);

        Key ??= `Result.${ReplaceId}`;
        ForKey ??= '(Item, Idx)';

        let SetFor = `${ForKey} in ${Key}`;

        $(JQueryId).attr(`v-for`, SetFor);
        return this;
    }

    /**
     * 將自訂 {BindAttrValue} Vue屬性加入至 ObjectId DOM
     * @param {any} ObjectId 不得為 undefined
     * @param {any} BindAttrValue { BindAttr : BindValue } 不得為 undefined
     */
    AddV_Custom(ObjectId, BindAttrValue = {}) {
        ObjectId = this.ToJQueryName(ObjectId);

        let GetBindKeys = Object.keys(BindAttrValue);
        if (GetColumnKeys.length > 0) {
            for (let Idx in GetBindKeys) {
                let BindAttr = GetBindKeys[Idx];
                let BindValue = BindAttrValue[BindAttr];
                $(ObjectId).attr(`${BindAttr}`, BindValue);
            }
        }
        return this;
    }

    AddV_Show(ObjectId, Key) {
        let JQueryId = this.ToJQueryObject(ObjectId);
        let ReplaceId = this.ToReplaceObjectId(ObjectId);
        Key ??= `Result.${ReplaceId}`;
        JQueryId.attr(`v-show`, Key);
        return this;
    }

    AddV_ShowMult(ObjectKey = {}) {
        let AllKey = Object.keys(ObjectKey);
        for (let Idx in AllKey) {
            let Key = AllKey[Idx];
            let Val = ObjectKey[Key];
            if (typeof Val === 'object')
                Val = Key;

            this.AddV_Show(Key, Val);
        }
        return this;
    }

    AddV_If(ObjectId, Key) {
        let JQueryId = this.ToJQueryObject(ObjectId);
        let ReplaceId = this.ToReplaceObjectId(ObjectId);
        Key ??= `Result.${ReplaceId}`;
        JQueryId.attr(`v-if`, Key);
        return this;
    }

    AddV_Else(ObjectId, Key) {
        let JQueryId = this.ToJQueryObject(ObjectId);
        let ReplaceId = this.ToReplaceObjectId(ObjectId);
        Key ??= `Result.${ReplaceId}`;
        JQueryId.attr(`v-if`, Key);
        return this;
    }

    AddV_ElseIf(ObjectId, Key) {
        let JQueryId = this.ToJQueryObject(ObjectId);
        let ReplaceId = this.ToReplaceObjectId(ObjectId);
        Key ??= `Result.${ReplaceId}`;
        JQueryId.attr(`v-if`, Key);
        return this;
    }
    // #endregion

    // #region Create Or Set Vue Property For DOM Object

    /**
     * <select> : 從 api 建構
     * @param {any} SelectId Dom Id
     * @param {any} Url Api Url
     * @param {any} ValueKey 可為 undefined，option value 值
     * @param {any} DisplayKey 可為 undefined，option 顯示字樣
     * @param {any} ResultKey 可為 undefined，綁定選擇欄位
     */
    AddV_Select(SelectId, Url = '', ValueKey = undefined, DisplayKey = undefined, ResultKey = undefined) {
        if (Url != undefined && Url != '')
            this.AddVue(SelectId, Url);
        let ReplaceId = this.ToReplaceObjectId(SelectId);
        this.AddV_SelectBind(SelectId, ReplaceId, ValueKey, DisplayKey, ResultKey);
        return this;
    }

    /**
     * <select>：從靜態 html 或 指定來源綁定
     * @param {any} SourceKey 指定來源
     * @param {any} SelectId Dom Id
     * @param {any} ValueKey 可為 undefined，option value 值
     * @param {any} DisplayKey 可為 undefined，option 顯示字樣
     * @param {any} ResultKey 可為 undefined，綁定選擇欄位
     */
    AddV_SelectBind(SelectId, SourceKey = undefined, ValueKey = undefined, DisplayKey = undefined, ResultKey = undefined) {
        if (SourceKey == undefined) {
            ResultKey ??= `Result.${SelectId}`;
            this.AddV_Model(SelectId, ResultKey);
        }
        else if (SourceKey != undefined) {
            let V_ForIn = `Item`;
            DisplayKey ??= `Item`;
            ValueKey ??= `Item`;
            ResultKey ??= ValueKey != 'Item' ? ValueKey : SelectId.replaceAll('_', '');

            if (!ResultKey.includes('.'))
                ResultKey = `Result.${ResultKey}`;

            this.AddV_Model(SelectId, ResultKey);

            if (!DisplayKey.includes('Item') && !DisplayKey.includes('.'))
                DisplayKey = `${V_ForIn}.${DisplayKey}`;

            if (!ValueKey.includes('Item') && !ValueKey.includes('.'))
                ValueKey = `${V_ForIn}.${ValueKey}`;

            let OptionObj = $('<option>');
            this.InsertAttrToJQuery(OptionObj, {
                'v-for': `${V_ForIn} in ${SourceKey}`,
                'v-text': `${DisplayKey}`,
                ':value': `${ValueKey}`
            });
            let JObjectId = this.ToJQueryName(SelectId);
            let SelectObj = $(JObjectId);
            SelectObj.append(OptionObj);
        }
        return this;
    }

    /**
     * <select>：自定義 Vue 屬性
     * @param {any} SelectId Dom Id
     * @param {any} V_Model 可為 undefined，綁定選擇欄位
     * @param {any} CustomOption 自定義 Vue 屬性
     */
    AddV_SelectCustom(SelectId, V_Model = undefined, CustomOption = {}) {

        SelectId = this.ToJQueryName(SelectId);

        V_Model ??= `Result.${V_Model}`;
        this.AddV_Model(SelectId, V_Model);
        if (Object.keys(CustomOption).length > 0) {
            let OptionObj = $('<option>');
            this.InsertAttrToJQuery(OptionObj, CustomOption);
            let SelectObj = $(SelectId);
            SelectObj.append(OptionObj);
        }
        return this;
    }

    /**
     * <button>：從靜態 html 綁定
     * @param {any} ButtonId Dom Id
     * @param {any} ClickFunction 點擊執行事件
     * @param {any} FuncKey 可為 undefined，事件名稱
     */
    AddV_Button(ButtonId, ClickFunction, FuncKey = undefined) {
        FuncKey ??= `Func${ButtonId}_Click`;
        this.AddFunction(FuncKey, ClickFunction, ButtonId, 'click');
        return this;
    }

    /**
     * <button>：從靜態 html 綁定多個
     * @param {any} ButtonIdResult Json 格式：{ DomId : 點擊執行事件 }
     */
    AddV_Button_Mult(ButtonIdResult = {}) {
        let AllKeys = Object.keys(ButtonIdResult);
        for (let Idx in AllKeys) {
            let ButtonId = AllKeys[Idx];
            let ClickResult = ButtonIdResult[ButtonId];
            let FuncKey = `${ButtonId}_Click`;
            this.AddV_Button(ButtonId, ClickResult, FuncKey);
        }
        return this;
    }

    /**
     * <input>：從靜態 html 綁定
     * @param {any} InputId Dom Id
     * @param {any} InputV_Model 可為 undefined，綁定輸入欄位
     */
    AddV_Input(InputId, InputV_Model = undefined) {
        InputV_Model ??= InputId;
        InputV_Model = this.ConvertResultKey(InputV_Model);
        InputV_Model = this.ToReplaceObjectId(InputV_Model);

        let JObj = this.ToJQueryObject(InputId);
        this.AddV_Model(InputId, InputV_Model, JObj.is('[type=number]'));

        let Value = JObj.val();
        if (Value != undefined && Value != '')
            this.RCS_UpdateResult(InputV_Model, Value, this.VueResult, true);

        return this;
    }

    /**
     * <input>：從靜態 html 綁定多個
     * @param {any} InputIdVModel Json 格式 : { DomId : 綁定輸入欄位 }
     * @param {any} KeyFor 綁定結果欄位來源
     */
    AddV_InputMult(InputIdVModel = {}, KeyFor = undefined) {
        let AllKeys = Object.keys(InputIdVModel);
        for (let Idx in AllKeys) {
            let InputId = AllKeys[Idx];
            KeyFor ??= 'Result';

            let GetVal = InputIdVModel[InputId];
            // 填入 { GetKey } 格式
            if (typeof GetVal != "string" || GetVal == undefined || GetVal == '' && KeyFor != undefined)
                GetVal = `${KeyFor}.${InputId}`;
            // 填入 { GetKey : GetValue }
            else if (typeof GetVal === "string" && GetVal.length > 0 && !GetVal.includes('.') && KeyFor != undefined)
                GetVal = `${KeyFor}.${GetVal}`;

            this.AddV_Input(InputId, GetVal);
        }
        return this;
    }

    AddV_Checkbox(ObjectId, Url, InputId, TextId = undefined, ValueKey = undefined, DisplayKey = undefined, ResultKey = undefined) {
        this.AddVue(ObjectId, Url);
        let ReplaceId = this.ToReplaceObjectId(ObjectId);
        let SourceKey = ReplaceId;
        this.AddV_CheckboxFrom(ObjectId, InputId, TextId, ValueKey, DisplayKey, SourceKey, ResultKey);
        return this;
    }

    AddV_CheckboxFrom(OuterId, InputId, TextId = undefined, ValueKey = undefined, DisplayKey = undefined, SourceKey = undefined, ResultKey = undefined) {
        this.BaseSet_DynamicInput(OuterId, InputId, TextId, ValueKey, DisplayKey, SourceKey, ResultKey);
        return this;
    }

    AddV_CheckboxBind(ObjectId, CheckedValue, ResultKey = undefined) {
        this.BaseSet_InputBind(ObjectId, CheckedValue, ResultKey);
        return this;
    }

    AddV_CheckboxBindMult(ResultKey, ObjectKeyValue = {}) {
        let AllKey = Object.keys(ObjectKeyValue);
        for (let Idx in AllKey) {
            let Key = AllKey[Idx];
            let Value = ObjectKeyValue[Key];

            if (Value === undefined || Value === '')
                Value = Key;
            else if (typeof Value === "object")
                Value = $(Value).val();

            this.AddV_CheckboxBind(Key, Value, ResultKey);
        }
        return this;
    }

    AddV_Checkbox_OtherBind(CheckboxId, TextInputId, IdResultKey = undefined, TextResultKey = undefined) {
        this.BaseSet_Input_OtherBind(CheckboxId, TextInputId, IdResultKey, TextResultKey);
        return this;
    }

    AddV_CheckboxYesNo(ObjectId, ResultKey = undefined) {
        let ReplaceId = this.ToReplaceObjectId(ObjectId);
        ResultKey ??= ReplaceId;
        ResultKey = this.ConvertResultKey(ResultKey);

        let JObj = this.ToJQueryObject(ObjectId);
        this.RCS_UpdateResult(ResultKey, JObj.prop('checked'), this.VueResult);

        this.AddV_Model(ObjectId, ResultKey);
        return this;
    }

    AddV_Radio(ObjectId, Url, InputId, TextId = undefined, ValueKey = undefined, DisplayKey = undefined, ResultKey = undefined) {

        this.AddVue(ObjectId, Url);
        let ReplaceId = this.ToReplaceObjectId(ObjectId);
        let SourceKey = ReplaceId;
        this.AddV_RadioFrom(ObjectId, InputId, TextId, ValueKey, DisplayKey, SourceKey, ResultKey);
        return this;
    }

    AddV_RadioFrom(OuterId, InputId, TextId = undefined, ValueKey = undefined, DisplayKey = undefined, SourceKey = undefined, ResultKey = undefined) {
        this.BaseSet_DynamicInput(OuterId, InputId, TextId, ValueKey, DisplayKey, SourceKey, ResultKey);
        return this;
    }

    AddV_RadioBind(InputId, CheckedValue, ResultKey = undefined) {
        this.BaseSet_InputBind(InputId, CheckedValue, ResultKey);
        return this;
    }

    AddV_RadioBindMult(ResultKey, ObjectKeyValue = {}) {
        let AllKey = Object.keys(ObjectKeyValue);
        for (let Idx in AllKey) {
            let Key = AllKey[Idx];
            let Value = ObjectKeyValue[Key];

            if (Value == undefined || Value === '')
                Value = Key;
            else if (typeof Value === "object")
                Value = $(Value).val();

            this.AddV_RadioBind(Key, Value, ResultKey);
        }
        return this;
    }

    AddV_Radio_OtherBind(RadioId, TextInputId, IdResultKey = undefined, TextResultKey = undefined) {
        this.BaseSet_Input_OtherBind(RadioId, TextInputId, IdResultKey, TextResultKey);
        return this;
    }

    AddV_File(InputId, UploadUrl = undefined, ResultKey = undefined) {

        let ReplaceId = InputId.replaceAll('_', '');
        ResultKey ??= `${ReplaceId}`;

        if (this.IsNotNullAndEmpty(UploadUrl))
            this.AddSubmit(ResultKey, UploadUrl);

        let SetResult = this.FileResult;
        this.AddV_On_Change(InputId, (e) => {
            let Files = e.target.files;
            if (SetResult[ResultKey] == undefined)
                SetResult[ResultKey] = {};
            SetResult[ResultKey][ReplaceId] = [];
            for (let i = 0; i < Files.length; i++) {
                let GetFile = Files[i];
                SetResult[ResultKey][ReplaceId].push(GetFile);
            }
        });
        return this;
    }

    AddV_FileMult(ResultKey, InputIdKey, UploadUrl = undefined) {

        if (UploadUrl != undefined)
            this.AddSubmit(ResultKey, UploadUrl);
        let SetResult = this.FileResult;
        SetResult[ResultKey] = {};

        let AllKey = Object.keys(InputIdKey);
        for (let Idx in AllKey) {
            let InputId = AllKey[Idx];
            let Key = InputIdKey[InputId];

            if (typeof Key === 'object')
                Key = InputId;

            let ReplaceKey = Key.replaceAll('_', '');
            this.AddV_On_Base(InputId, 'change', undefined, (e) => {
                let Files = e.target.files;
                if (SetResult[ResultKey] == undefined)
                    SetResult[ResultKey] = {};
                SetResult[ResultKey][ReplaceKey] = [];
                for (let i = 0; i < Files.length; i++) {
                    let GetFile = Files[i];
                    SetResult[ResultKey][ReplaceKey].push(GetFile);
                }
            });
        }
        return this;
    }

    // #endregion

    // #region Base Dom Set Method
    BaseSet_DynamicInput(OuterId, InputId, TextId = undefined, ValueKey = undefined, DisplayKey = undefined, SourceKey = undefined, ResultKey = undefined) {

        let ReplaceId = this.ToReplaceObjectId(OuterId);
        SourceKey ??= ReplaceId;
        ResultKey ??= ReplaceId;
        ResultKey = this.ConvertResultKey(ResultKey);

        let JObjInput = this.ToJQueryObject(InputId);
        if (JObjInput.is(':checkbox'))
            this.RCS_GetResult(ResultKey, this.VueResult, true, []);
        else
            this.RCS_GetResult(ResultKey, this.VueResult, false);

        this.AddV_For(OuterId, SourceKey);
        this.AddV_Model(InputId, ResultKey);

        if (ValueKey == undefined) {
            let InputValue = JObjInput.attr('value');
            ValueKey = InputValue != undefined ? InputValue : this.ToReplaceObjectId(InputId);
        }
        ValueKey = `Item.${ValueKey}`;
        this.AddV_Bind(InputId, 'value', ValueKey);

        if (DisplayKey == undefined) {
            let TxtJObj = this.ToJQueryObject(TextId);
            let TxtValue = TxtJObj.attr('value');
            DisplayKey = TxtValue != undefined ? TxtValue : this.ToReplaceObjectId(TextId);
        }
        DisplayKey = `Item.${DisplayKey}`;
        if (TextId != undefined)
            this.AddV_Text(TextId, DisplayKey);

        return this;
    }

    BaseSet_InputBind(InputId, CheckedValue, ResultKey = undefined) {

        let ReplaceId = this.ToReplaceObjectId(InputId);
        ResultKey ??= ReplaceId;
        ResultKey = this.ConvertResultKey(ResultKey);
        ResultKey = this.ToReplaceObjectId(ResultKey);

        let JObjInput = this.ToJQueryObject(InputId);
        if (JObjInput.is(':checkbox'))
            this.RCS_GetResult(ResultKey, this.VueResult, true, []);
        else
            this.RCS_GetResult(ResultKey, this.VueResult, false);

        let JObj = this.ToJQueryObject(InputId);
        CheckedValue = CheckedValue ?? JObj.attr('value');
        CheckedValue = CheckedValue ?? ReplaceId;
        if (this.IsNumberOrBool(CheckedValue))
            this.AddV_Bind(InputId, 'value', this.ConvertBoolOrNumber(CheckedValue))

        this.AddV_Model(InputId, ResultKey);
        return this;
    }

    BaseSet_Input_OtherBind(ClickInputId, TextInputId, IdResultKey, TextResultKey) {
        this.AddV_Model(ClickInputId, IdResultKey);
        this.AddV_Model(TextInputId, TextResultKey);

        let ChkJObj = this.ToJQueryObject(ClickInputId);
        let ChkVal = ChkJObj.val();
        if (this.IsNumberOrBool(ChkVal))
            ChkVal = this.ConvertBoolOrNumber(ChkVal);

        this.AddV_Bind(ClickInputId, 'value', ChkVal);
        return this;
    }

    // #endregion

    // #region Auto Bind
    AddAutoBind_Input(AutoBindKeys = ['inp.'], ResultKey = undefined) {
        ResultKey ??= 'Result';
        if (typeof AutoBindKeys === 'string')
            AutoBindKeys = [AutoBindKeys];

        for (let Idx in AutoBindKeys) {
            let AutoBindKey = AutoBindKeys[Idx];
            let AllInput = $(`[id*='${AutoBindKey}']`);

            for (let Idx = 0; Idx < AllInput.length; Idx++) {
                let GetInput = AllInput[Idx];
                let Id = GetInput.id;

                let GetSplitId = Id.split(`${AutoBindKey}`)[1];
                let GetResultKey = `${ResultKey}.${GetSplitId}`;
                this.AddV_Input(Id, GetResultKey);
            }
        }

        return this;
    }

    AddAutoBind_Text(AutoBindKeys = ['txt.'], ResultKey = undefined) {
        ResultKey ??= 'Result';
        if (typeof AutoBindKeys === 'string')
            AutoBindKeys = [AutoBindKeys];

        for (let Idx in AutoBindKeys) {
            let AutoBindKey = AutoBindKeys[Idx];
            let AllText = $(`[id*='${AutoBindKey}']`);
            for (let Idx = 0; Idx < AllText.length; Idx++) {
                let GetText = AllText[Idx];
                let Id = GetText.id;

                let GetSplitId = Id.split(`${AutoBindKey}`)[1];
                let GetResultKey = `${ResultKey}.${GetSplitId}`;

                this.AddV_Text(Id, GetResultKey);
            }
        }

        return this;
    }

    AddAutoBind_SelectBind(AutoBindKeys = ['sel.'], ResultKey = undefined) {
        ResultKey ??= 'Result';
        if (typeof AutoBindKeys === 'string')
            AutoBindKeys = [AutoBindKeys];

        for (let Idx in AutoBindKeys) {
            let AutoBindKey = AutoBindKeys[Idx];
            let AllSelect = $(`[id*='${AutoBindKey}']`);
            for (let Idx = 0; Idx < AllSelect.length; Idx++) {
                let GetSelect = AllSelect[Idx];
                let Id = GetSelect.id;

                let GetSplitId = Id.split(`${AutoBindKey}`)[1];
                let GetResultKey = `${ResultKey}.${GetSplitId}`;

                this.AddV_SelectBind(Id, undefined, undefined, undefined, GetResultKey);
            }
        }

        return this;
    }

    AddAutoBind_CheckboxYesNo(AutoBindKeys = ['chk.'], ResultKey = undefined, TrueValue = true, FalseValue = false) {
        ResultKey ??= 'Result';
        if (typeof AutoBindKeys === 'string')
            AutoBindKeys = [AutoBindKeys];

        for (let Idx in AutoBindKeys) {
            let AutoBindKey = AutoBindKeys[Idx];
            let AllCheckbox = $(`[id*='${AutoBindKey}']`);
            for (let Idx = 0; Idx < AllCheckbox.length; Idx++) {
                let GetSelect = AllCheckbox[Idx];
                let Id = GetSelect.id;

                let GetSplitId = Id.split(`${AutoBindKey}`)[1];
                let ReplaceId = this.ToReplaceObjectId(GetSplitId);
                let GetResultKey = `${ResultKey}.${ReplaceId}`;

                this.AddV_CheckboxYesNo(Id, GetResultKey, TrueValue, FalseValue);
            }
        }
        return this;
    }

    AddAutoBind_Checkbox(AutoBindKeys = ['chks.'], ResultKey = undefined) {
        ResultKey ??= 'Result';
        if (typeof AutoBindKeys === 'string')
            AutoBindKeys = [AutoBindKeys];

        for (let Idx in AutoBindKeys) {
            let AutoBindKey = AutoBindKeys[Idx];
            let AllSelect = $(`[id*='${AutoBindKey}']`);
            for (let Idx = 0; Idx < AllSelect.length; Idx++) {
                let GetSelect = AllSelect[Idx];
                let Id = GetSelect.id;

                let GetSplitId = Id.split(`${AutoBindKey}`)[1];
                let ReplaceId = this.ToReplaceObjectId(GetSplitId);
                let GetResultKey = `${ResultKey}.${ReplaceId}`;
                this.AddV_CheckboxBind(Id, undefined, GetResultKey);
            }
        }
        return this;
    }

    AddAutoBind_Radio(AutoBindKeys = ['rad.'], ResultKey = undefined) {
        ResultKey ??= 'Result';
        if (typeof AutoBindKeys === 'string')
            AutoBindKeys = [AutoBindKeys];

        for (let Idx in AutoBindKeys) {
            let AutoBindKey = AutoBindKeys[Idx];
            let AllRadio = $(`[id*='${AutoBindKey}']`);
            for (let Idx = 0; Idx < AllRadio.length; Idx++) {
                let GetRadio = AllRadio[Idx];
                let Id = GetRadio.id;

                let GetSplitId = Id.split(`${AutoBindKey}`)[1];
                let GetResultKey = `${ResultKey}.${GetSplitId}`;

                this.AddV_RadioBind(Id, undefined, GetResultKey);
            }
        }
        return this;
    }

    AddAutoBind_On(AutoBindKeys = [], EventName, ResultFunc, FunctionKey) {

        let AllBindKey = '';
        if (typeof AutoBindKeys === 'string')
            AutoBindKeys = [AutoBindKeys];

        for (let Idx in AutoBindKeys) {
            let AutoBindKey = AutoBindKeys[Idx];
            AllBindKey += AutoBindKey.replaceAll('.', '').replaceAll('_', '');
        }
        FunctionKey ??= `AutoBindOn${EventName}For${AllBindKey}`;
        if (ResultFunc != undefined)
            this.AddFunction(FunctionKey, ResultFunc);

        for (let KeyIdx in AutoBindKeys) {
            let AutoBindKey = AutoBindKeys[KeyIdx];
            let AllDom = $(`[id*='${AutoBindKey}']`);
            for (let Idx = 0; Idx < AllDom.length; Idx++) {
                let GetDom = AllDom[Idx];
                let Id = GetDom.id;
                this.AddV_On(Id, EventName, FunctionKey);
            }
        }
        return this;
    }

    AddAutoBind_For(AutoBindKeys = ['for.'], ResultKey = undefined) {

        if (typeof AutoBindKeys === 'string')
            AutoBindKeys = [AutoBindKeys];

        for (let Idx in AutoBindKeys) {
            let AutoBindKey = AutoBindKeys[Idx];
            let AllText = $(`[id*='${AutoBindKey}']`);
            for (let Idx = 0; Idx < AllText.length; Idx++) {
                let GetText = AllText[Idx];
                let Id = GetText.id;
                let GetSplitId = Id.split(`${AutoBindKey}`)[1];
                let SetResultKey = ResultKey ?? GetSplitId;
                this.AddV_For(Id, SetResultKey);
            }
        }

        return this;
    }

    // #endregion

    // #region Ajax To Server

    /**
     * 送出 Ajax 請求，並從 AjaxUrl 字典撈出該 {Key} 的 Url，將 SendData 帶入並送出
     * @param {any} SendData 可接受 object {} 及 string ''，若 MethodType 為 GET 則串在 Url 上送出，若為 POST 則轉成 JSON 以 body 送出
     * @param {any} Key 若為 undefined 則使用 ElementName 作為 Key 值
     * @param {any} MethodType 若為 undefined 則使用預設 this.MethodType 作為 MethodType 值，執行後並儲存
     * @param {any} OnSuccess 若不為 undefined 則在 Ajax success 後額外執行
     * @param {any} OnError 若不為 undefined 則在 Ajax error 後額外執行
     * @param {any} OnComplate 若不為 undefined 則在 Ajax complate 後額外執行
     */
    Ajax(SendData = {}, Key = undefined, MethodType = undefined, OnSuccess = undefined, OnError = undefined, OnComplate = undefined) {
        this.VueInit();

        this.MethodType = MethodType ?? this.MethodType;
        let RootResult = this.VueResult;

        Key ??= this.ElementName;

        let Caller = this;
        let SuccessCallback = this.AjaxSuccess;
        let ErrorCallback = this.AjaxError;
        let CompleteCallback = this.AjaxComplete;
        let SendType = this.MethodType;
        let SuccessCheck = this.AjaxSuccessCheck;

        let SendUrl = this.GetUrl(Key);

        let IsDevelopment = this.IsDevelopment;
        if (IsDevelopment) {
            console.log(`Ajax Send : ${SendData}`);
        }

        if (typeof SendData === 'object' && Object.keys(SendData).length > 0 && SendType == 'POST')
            SendData = JSON.stringify(SendData);
        let UpdateKey = Key == this.ToReplaceObjectId(this.ElementName) ? 'Result' : this.ToReplaceObjectId(Key);

        this.AjaxOptions = {
            type: SendType,
            url: SendUrl,
            data: SendData,
            dataType: 'JSON',
            contentType: 'application/json;charset=utf-8',
            success: function (Result) {
                let IsSuccess = SuccessCheck == undefined ? true : SuccessCheck.call(Caller, Result);
                if (IsSuccess) {
                    SuccessCallback.call(Caller, UpdateKey, Result);
                    OnSuccess?.call(Caller, Result);
                }
                else {
                    RootResult.ErrorResult = Result;
                    ErrorAlert?.call(Caller, Result);
                }
            },
            error: function (Error) {
                if (IsDevelopment) {
                    RootResult.ErrorResult = Error;
                    console.log(`Ajax Error : ${Error}`);
                }
                ErrorCallback.call(Caller, Error);
                OnError?.call(Caller, Error);
            },
            complete: function () {
                CompleteCallback.call(Caller);
                OnComplate?.call(Caller);
            },
            headers: {
                Authorization: this.GetToken == undefined ? 'null' : this.GetToken(),
            },
        };
        $.ajax(this.AjaxOptions);
        return this;
    }


    /**
     * 送出 Ajax 請求，並從 SubmitUrl 字典撈出該 {Key} 的 Url，將 VueResult[Key] 帶入 body 並送出
     * @param {any} Key 若為 undefined 則使用 ElementName 作為 Key 值，並將 VueResult.Result 帶入
     * @param {any} MethodType 若為 undefined 則使用 POST 作為 MethodType 值
     * @param {any} SendParam 若不為 undefined 則無視 VueResult[Key] 帶入參數，並帶入此參數
     * @param {any} _OnSuccess 若不為 undefined 則在 Ajax success 後額外執行
     * @param {any} _OnError 若不為 undefined 則在 Ajax error 後額外執行
     * @param {any} _OnComplate 若不為 undefined 則在 Ajax complate 後額外執行
     */
    Submit(Key, MethodType = undefined, SendParam = undefined, _OnSuccess = undefined, _OnError = undefined, _OnComplate = undefined, MuteRequestErrorAlert = false) {

        let SuccessBackPage = this.SuccessBackPage;
        let SendData, OnSuccess, OnError, OnComplate, SendUrl;
        let ErrorAlert;
        let RootResult = this.VueResult;

        let Caller = this;

        Key ??= this.ElementName;
        MethodType ??= 'POST'

        let Param = this.SubmitUrl[Key];

        if (Key == this.ElementName) {
            SendUrl = this.SubmitUrl[this.ElementName].Url;
            SendData = this.VueResult.Result;
        }
        else {
            SendData = this.VueResult[Key];
            SendUrl = Param.Url;
        }
        SendUrl = this.ConvertToUrl(SendUrl);

        if (SendParam != undefined)
            SendData = SendParam;

        OnSuccess = _OnSuccess ?? Param.OnSuccess;
        OnError = _OnError ?? Param.OnError;
        OnComplate = _OnComplate ?? Param.OnComplate;
        ErrorAlert = this.ErrorAlert;
        let SuccessCheck = this.SubmitSuccessCheck;

        let CheckModel = this.CheckSubmitModel(Key, SendData);
        if (!CheckModel.Check) {
            if (this.OnCheckFalse != undefined)
                this.OnCheckFalse(CheckModel.FalseColumn);

            return this;
        }

        let IsDevelopment = this.IsDevelopment;
        if (IsDevelopment) {
            console.log(`Submit Send : ${SendData}`);
        }

        if (typeof SendData === 'object' && Object.keys(SendData).length > 0 && MethodType == 'POST')
            SendData = JSON.stringify(SendData);
        let SubmitOptions = {
            type: MethodType,
            url: SendUrl,
            data: SendData,
            dataType: 'JSON',
            contentType: 'application/json;charset=utf-8',
            success: function (Result) {
                let IsSuccess = SuccessCheck == undefined ? true : SuccessCheck.call(Caller, Result);
                if (IsSuccess) {
                    OnSuccess?.call(Caller, Result);
                    SuccessBackPage?.call(Caller);
                }
                else {
                    RootResult.ErrorResult = Result;
                    ErrorAlert?.call(Caller, Result);
                }
            },
            error: function (Error) {
                OnError?.call(Caller, Error);
                if (IsDevelopment) {
                    RootResult.ErrorResult = Error;
                    console.log(`Submit Error : ${Error}`);
                }
                if (!MuteRequestErrorAlert)
                    alert('Request 錯誤');
            },
            complete: function () {
                OnComplate?.call(Caller);
            },
            headers: {
                Authorization: this.GetToken == undefined ? 'null' : this.GetToken(),
            },
        };
        $.ajax(SubmitOptions);
        return this;
    }

    Submit_File(Key, SendParam = undefined, _OnSuccess = undefined, _OnError = undefined, _OnComplate = undefined) {

        let SuccessBackPage = this.FileSuccessBackPage;
        let SendData, OnSuccess, OnError, OnComplate, SendUrl;
        let Caller = this;
        let ReplaceKey = this.ToReplaceObjectId(Key);
        let Param = this.SubmitUrl[ReplaceKey];

        OnSuccess = _OnSuccess ?? Param.OnSuccess;
        OnError = _OnError ?? Param.OnError;
        OnComplate = _OnComplate ?? Param.OnComplate;

        Key ??= this.ElementName;

        SendData = this.FileResult[ReplaceKey];
        SendUrl = Param.Url;
        SendUrl = this.ConvertToUrl(SendUrl);

        if (SendParam != undefined) {
            let UrlParam = this.ConvertUrlParam(SendParam);
            SendUrl += `?${UrlParam}`;
        }

        let CheckModel = this.CheckSubmitModel(Key, SendData);
        if (!CheckModel.Check) {
            if (this.OnCheckFalse != undefined)
                this.OnCheckFalse(CheckModel.FalseColumn);
            return this;
        }

        let FileModel = this.ConvertSendFile(Key, SendData);

        let SuccessCheck = this.SubmitSuccessCheck;
        let SubmitOptions = {
            type: 'POST',
            url: SendUrl,
            data: FileModel,
            contentType: false,
            processData: false,
            success: function (Result) {
                let IsSuccess = SuccessCheck == undefined ? true : SuccessCheck.call(Caller, Result);
                if (IsSuccess) {
                    OnSuccess?.call(Caller, Result);
                    SuccessBackPage?.call(Caller);
                }
            },
            error: function (Error) {
                OnError?.call(Caller, Error);
                alert('上傳失敗');
            },
            complete: function () {
                OnComplate?.call(Caller);
            },
            headers: {
                Authorization: this.GetToken == undefined ? 'null' : this.GetToken(),
            },
        };
        $.ajax(SubmitOptions);
        return this;
    }

    Submit_FileMult(KeyParam, _OnComplate = undefined) {
        this.RCS_Submit_FileMult(KeyParam, 0, _OnComplate);
        return this;
    }

    RCS_Submit_FileMult(KeyParam, SubmitIndex, _OnComplate = undefined) {
        let AllKey = Object.keys(KeyParam);
        if (SubmitIndex < AllKey.length) {
            let Key = AllKey[SubmitIndex];
            let Param = KeyParam[Key];
            if (this.IsHasFile(Key)) {
                this.Submit_File(Key, Param, () => {
                    this.RCS_Submit_FileMult(KeyParam, SubmitIndex + 1, _OnComplate);
                });
            }
            else
                this.RCS_Submit_FileMult(KeyParam, SubmitIndex + 1, _OnComplate);
        }
        else if (_OnComplate != undefined)
            _OnComplate();
    }

    Submit_File_Base(Key, SendData, SendParam = undefined, _OnSuccess = undefined, _OnError = undefined, _OnComplate = undefined) {

        let SuccessBackPage = this.FileSuccessBackPage;
        let OnSuccess, OnError, OnComplate, SendUrl;
        let Caller = this;
        let ReplaceKey = this.ToReplaceObjectId(Key);
        let Param = this.SubmitUrl[ReplaceKey];

        OnSuccess = _OnSuccess ?? Param.OnSuccess;
        OnError = _OnError ?? Param.OnError;
        OnComplate = _OnComplate ?? Param.OnComplate;

        Key ??= this.ElementName;

        SendUrl = Param.Url;
        SendUrl = this.ConvertToUrl(SendUrl);

        if (SendParam != undefined) {
            let UrlParam = this.ConvertUrlParam(SendParam);
            SendUrl += `?${UrlParam}`;
        }

        let FileModel = new FormData();
        if (SendData != undefined)
            FileModel.append(Key, SendData);

        let SuccessCheck = this.SubmitSuccessCheck;
        let SubmitOptions = {
            type: 'POST',
            url: SendUrl,
            data: FileModel,
            contentType: false,
            processData: false,
            success: function (Result) {
                let IsSuccess = SuccessCheck == undefined ? true : SuccessCheck.call(Caller, Result);
                if (IsSuccess) {
                    OnSuccess?.call(Caller, Result);
                    SuccessBackPage?.call(Caller);
                }
            },
            error: function (Error) {
                OnError?.call(Caller, Error);
                alert('上傳失敗');
            },
            complete: function () {
                OnComplate?.call(Caller);
            },
            headers: {
                Authorization: this.GetToken == undefined ? 'null' : this.GetToken(),
            },
        };
        $.ajax(SubmitOptions);
        return this;
    }

    Submit_FileMult_Base(Key, FileDataArray, SendParamArray = undefined, _OnComplate = undefined) {
        this.RCS_Submit_FileMult_Base(Key, FileDataArray, SendParamArray, 0, _OnComplate);
        return this;
    }

    RCS_Submit_FileMult_Base(Key, FileDataArray, SendParamArray, SubmitIndex, _OnComplate = undefined) {
        if (SubmitIndex < FileDataArray.length) {
            let FileData = FileDataArray[SubmitIndex];
            let SendParam = SendParamArray[SubmitIndex];
            this.Submit_File_Base(Key, FileData, SendParam, () => {
                this.RCS_Submit_FileMult_Base(Key, FileDataArray, SendParamArray, SubmitIndex + 1, _OnComplate);
            });
        }
        else if (_OnComplate != undefined)
            _OnComplate();
    }


    SubmitCustom(Key, AjaxOption = {}) {

        let SuccessBackPage = this.SuccessBackPage;

        let Caller = this;

        Key ??= this.ElementName;
        let MethodType = 'POST'

        let Param = this.SubmitUrl[Key];
        let SendUrl = Key == this.ElementName ? this.SubmitUrl[this.ElementName].Url : Param.Url;

        let OnSuccess = Param.OnSuccess;
        let OnError = Param.OnError;
        let OnComplate = Param.OnComplate;
        let SubmitOptions = {
            type: MethodType,
            url: SendUrl,
            success: function (Result) {
                if (Result.IsSuccess) {
                    OnSuccess?.call(Caller, Result);
                    SuccessBackPage?.call(Caller);
                }
                else {
                    alert(Result.Msg);
                }
            },
            error: function (Error) {
                OnError?.call(Caller, Error);
                alert('Request 錯誤');
            },
            complete: function () {
                OnComplate?.call(Caller);
            },
            headers: {
                Authorization: this.GetToken == undefined ? 'null' : this.GetToken(),
            },
        };
        $.extend(SubmitOptions, AjaxOption);
        $.ajax(SubmitOptions);
        return this;
    }
    // #endregion

    // #region Event After Ajax

    /**
     * *預設內部 Function
     * 預設 Ajax 後 success 執行，將回傳 Result 存入 VueResult[Key] 存放區，並執行預設 'OnSuccess(Result)'，並初始化原生 Vue，使用 'UpdateVueModel(Result, Key)', 'VueInit()'
     * @param {any} Key 若為 undefined 則使用 ElementName 作為 Key 值
     * @param {any} Result 可接受 string、object、json
     */
    AjaxSuccess(Key, Result) {
        Key = Key == this.ToReplaceObjectId(this.ElementName) ? undefined : Key;
        if (Result != undefined) {
            this.UpdateVueModel(Result, Key, true);
        }
        this.OnSuccess(Result);
    }

    /**
     * *預設內部 Function
     * 預設 Ajax 後 error 執行，並執行預設 'OnError(Error)'，並初始化原生 Vue，使用 'VueInit()'
     * @param {any} Error 可接受 string
     */
    AjaxError(Error) {
        this.OnError(Error);
    }

    /**
     * *預設內部 Function
     * 預設 Ajax 後 complete 執行，並執行預設 'OnComplete()'
     * */
    AjaxComplete() {
        this.OnComplete();
    }
    // #endregion

    // #region Update Custom Model

    /**
     * 將 Result 更新至 VueResult[Key] 存放區
     * @param {any} Result 可接受 string、object、json
     * @param {any} Key 若為 undefined 則使用 ElementName 作為 Key 值
     */
    UpdateVueModel(Result, Key = undefined, IsReplace = false) {
        Key = this.CheckKey(Key);
        Key = (Key == this.ElementName) ? 'Result' : Key;
        Key = this.ToReplaceObjectId(Key);

        if (this.IsString(Result) && this.IsJson(Result))
            Result = JSON.parse(Result);

        this.RCS_UpdateResult(Key, Result, this.VueResult, IsReplace);
        return this;
    }

    /**
     * 將多個 KeyResult { Key : Result } 更新至 VueResult[Key] 存放區，推薦使用同名屬性執行，使用 'UpdateVueModel()'
     * @param {any} KeyResult 接受 { Result }，同 'Result' : Result
     * 若 Key 值為 'default'，則使用 ElementName 作為 Key 值
     */
    UpdateVueModelMult(KeyResult = {}, IsReplace = false) {

        let ObjectKeys = Object.keys(KeyResult);
        for (let Idx in ObjectKeys) {
            let GetKey = ObjectKeys[Idx];
            let GetResult = KeyResult[GetKey];
            if (GetKey.toLowerCase().includes('default'))
                GetKey = undefined;
            this.UpdateVueModel(GetResult, GetKey, IsReplace);
        }
        return this;
    }

    /**
     * 將 PageData 更新至 VueResult.PageData 存放區
     * @param {any} PageData 不得為 undefined
     */
    UpdatePageData(PageData) {
        this.PageData = PageData ?? this.PageData;
        return this;
    }
    // #endregion

    // #region Convert And Check

    /**
     * *預設內部 Function
     * 於 Submit 前檢核各項欄位
     * @param {any} SubmitKey 不得為 undefined
     * @param {any} Model 不得為 undefined
     */
    CheckSubmitModel(SubmitKey, Model) {
        let CheckRet = {
            Check: true,
            FalseColumn: '',
        };

        if (this.SubmitCheckColumnKeys == undefined)
            return CheckRet;

        let CheckKeys = Object.keys(this.SubmitCheckColumnKeys);
        if (CheckKeys.length == 0)
            return CheckRet;

        let CheckColumns = this.SubmitCheckColumnKeys[SubmitKey];
        if (CheckColumns.length == 0)
            return CheckRet;

        return this.CheckColumn(CheckColumns, Model);
    }

    CheckColumn(CheckColumns, Model) {
        let CheckRet = {
            Check: true,
            FalseColumn: '',
        };
        for (let Key in CheckColumns) {
            let Val = CheckColumns[Key];
            if (Model[Key] == undefined || Model[Key] === '') {
                CheckRet.Check = false;
                CheckRet.FalseColumn = Val;
                return CheckRet;
            }
        }
        return CheckRet;
    }

    /**
     * *預設內部 Function
     * 將參數轉換為相對網址
     * @param {any} Action 不得為 undefined
     * @param {any} Controller 若為 undefined 則忽略
     * @param {any} Domain 若為 undefined 則忽略
     */
    ToUrl(Action, Controller, Domain) {
        let Url = Action;
        if (Controller != undefined) {
            Url = `${Controller}/${Action}`;
            if (Domain != undefined) {
                Url = `${Domain}/${Controller}/${Action}`;
            }
        }
        window.location.href = Url;
    }

    ToUrlWithParam(Url, Param) {
        let GetParam = this.ConvertUrlParam(Param);
        let GetUrl = `${Url}?${GetParam}`;
        window.location.href = GetUrl;
    }

    /**
     * *預設內部 Function
     * 從 AjaxUrl 字典中取得 Url，並依照 MethodType : 'GET'/'POST' 判斷是否將 SendData 帶入至網址
     * @param {any} Key 不得為 undefined
     * @param {any} SendData 不得為 undefined
     * @param {any} MethodType 不得為 undefined
     */
    GetUrl(Key) {
        let SendUrl = this.UrlKeyDic[Key];
        let ReturnUrl = this.ConvertToUrl(SendUrl);
        return ReturnUrl;
    }

    /**
     * *預設內部 Function
     * 是否為 string，執行 typeof Obj === "string"
     * @param {any} Obj 不得為 undefined
     */
    IsString(Obj) { return typeof Obj === "string"; }

    /**
     * *預設內部 Function
     * 是否為 object，執行 typeof Obj === "object"
     * @param {any} Obj 不得為 undefined
     */
    IsObject(Obj) { return typeof Obj === "object"; }

    /**
     * *預設內部 Function
     * 是否為 json，執行 try { JSON.parse(Obj) }
     * @param {any} Obj 不得為 undefined
     */
    IsJson(Obj) {
        try {
            JSON.parse(Obj);
        } catch (ex) {
            return false;
        }
        return true;
    }

    /**
     * *預設內部 Function
     * Key 值是否為預設 undefined，執行 Key ?? this.ElementName
     * @param {any} Key 若為 undefined 則回傳 ElementName
     */
    CheckKey(Key = undefined) { return Key ?? this.ElementName; }

    /**
     * *預設內部 Function
     * 判斷 ObjectId 是否為 JQueryName:'#ObjectId'
     * @param {any} ObjectId 若不包含 '#' 字 則回傳 `#${ObjectId}`
     */
    ToJQueryName(ObjectId, IsUseIdFormat = true) {
        if (ObjectId == undefined)
            return ObjectId;

        if (ObjectId.includes('#') || ObjectId.includes('[') || ObjectId.includes(']') || ObjectId.includes('='))
            return ObjectId;

        if (IsUseIdFormat)
            return `[id='${ObjectId}']`;

        return `#${ObjectId}`;
    }

    ToJQueryObject(ObjectId, IsUseIdFormat = true) {
        return $(this.ToJQueryName(ObjectId, IsUseIdFormat));
    }

    ToReplaceObjectId(ObjectId) {
        let Ret = ObjectId.replaceAll('_', '').replaceAll('#', '');
        return Ret;
    }

    IsNotNullAndEmpty(AssignString) {
        if (AssignString == undefined)
            return false;
        AssignString = AssignString.replaceAll(' ', '');
        if (AssignString != undefined && AssignString != '')
            return true;
        return false;
    }

    /**
     * *預設內部 Function
     * 將 ColumnKeys { ColumnKey : Key } 加入至 JQureyObj
     * @param {any} JQureyObj 不得為 undefined
     * @param {any} ColumnKeys 不得為 undefined
     */
    InsertAttrToJQuery(JQureyObj, ColumnKeys = {}) {
        try {
            let GetColumnKeys = Object.keys(ColumnKeys);
            if (GetColumnKeys.length > 0) {
                for (let Idx in GetColumnKeys) {
                    let GetCol = GetColumnKeys[Idx];
                    let AttrValue = ColumnKeys[GetCol];
                    JQureyObj.attr(`${GetCol}`, AttrValue);
                }
            }
        } catch (ex) { }
    }

    ConvertToUrl(SendUrl) {

        if (!(typeof SendUrl === 'string'))
            return SendUrl;

        if (SendUrl.includes('http'))
            return SendUrl;

        if (this.Domain != undefined) {
            if (this.Domain[this.Domain.length - 1] != '/')
                this.Domain += '/';
            SendUrl = `${this.Domain}${SendUrl}`;
        }
        return SendUrl;
    }

    SetAttr(ObjectId, AttrName, AttrValue) {
        let JObject = $(this.ToJQueryName(ObjectId));
        JObject.attr(AttrName, AttrValue);
    }

    ConvertAttrToArray(HtmlAttr = {}) {
        let Ret = [];
        let AllKey = Object.keys(HtmlAttr);
        for (let Idx in AllKey) {
            let Key = AllKey[Idx];
            let Val = HtmlAttr[Key];
            let AddAttr = `${Key}="${Val}"`;
            Ret.push(AddAttr);
        }
        return Ret;
    }

    // #endregion

    // #region Process DomEvent

    CreateDomEvent(ObjectId, EventFuncKey) {
        if (this.DomEventFunc[ObjectId] == undefined)
            this.DomEventFunc[ObjectId] = {};

        let DomEventFunc = this.DomEventFunc[ObjectId];
        if (DomEventFunc[EventFuncKey] == undefined)
            DomEventFunc[EventFuncKey] = [];
        return DomEventFunc[EventFuncKey];
    }

    PushDomEvent(ObjectId, EventFuncKey, EventFunc) {
        let EventStorage = this.CreateDomEvent(ObjectId, EventFuncKey);
        EventStorage.push(EventFunc);
    }

    OnDomEvent(ObjectId, EventFuncKey, Arg) {
        let EventStorage = this.DomEventFunc[ObjectId][EventFuncKey];
        for (let Idx in EventStorage) {
            EventStorage[Idx](Arg);
        }
    }
    // #endregion

    // #region Process Type
    ConvertBool(BoolValue) {
        if (typeof BoolValue === 'string') {
            if (BoolValue.toLowerCase() == 'true')
                return true;
            else if (BoolValue.toLowerCase() == 'false')
                return false;
        }
        return BoolValue;
    }

    ConvertNumber(NumberValue) {
        let RetNumber = -1;
        if (this.IsNumber(NumberValue))
            RetNumber = Number(NumberValue);
        return RetNumber;
    }

    ConvertBoolOrNumber(ConvertValue) {

        if (this.IsBool(ConvertValue))
            return this.ConvertBool(ConvertValue);

        return this.ConvertNumber(ConvertValue);
    }

    ConvertSendFile(Key, FileData) {
        Key ??= 'File';
        Key = this.ToReplaceObjectId(Key);
        let SendForm = new FormData();

        let IdKey = Object.keys(FileData);
        let FileNo = 0;
        for (let Idx in IdKey) {
            let GetId = IdKey[Idx];
            let GetFiles = FileData[GetId];
            let IsSingleFile = IdKey.length == 1 && GetFiles.length == 1;
            for (let FileIdx in GetFiles) {
                let GetFile = GetFiles[FileIdx];
                let SetKey = IsSingleFile ? GetId : `${GetId}_${FileNo}`;
                SendForm.append(SetKey, GetFile);
                FileNo++;
            }
        }

        return SendForm;
    }

    ConvertUrlParam(Param) {
        let GetParams = [];
        if (typeof Param === 'string')
            return Param;
        else if (Array.isArray(Param)) {
            for (let Item in Param)
                GetParams.push(Item);
        }
        else {
            let AllKey = Object.keys(Param);
            for (let Idx in AllKey) {
                let Key = AllKey[Idx];
                let GetParam = Param[Key];
                GetParams.push(`${Key}=${GetParam}`);
            }
        }

        let UrlParam = GetParams.join('&');
        return UrlParam;
    }

    ConvertResultKey(Key, ResultKey = 'Result') {
        if (!Key.includes('.'))
            Key = `${ResultKey}.${Key}`;

        return Key;
    }

    IsNumber(NumberValue, IsCanEmpty = true) {
        if (!IsCanEmpty && (NumberValue == '' || NumberValue == undefined))
            return false;
        let RetTrue = !isNaN(NumberValue);
        return RetTrue;
    }

    IsBool(BoolValue) {
        if (typeof BoolValue === 'string') {
            if (BoolValue.toLowerCase() == 'true' || BoolValue.toLowerCase() == 'false')
                return true;
        }
        return false;
    }

    IsNumberOrBool(ConvertValue) {
        return this.IsBool(ConvertValue) || this.IsNumber(ConvertValue);
    }

    IsHasFile(FindKey = undefined, ResultKey = undefined) {
        ResultKey ??= FindKey;
        if (FindKey != undefined) {
            let GetResult = this.FileResult[ResultKey];
            if (GetResult != undefined) {
                let GetKey = GetResult[FindKey];
                if (GetKey != undefined && GetKey.length > 0)
                    return true;
            }
        } else {
            let AllResultKey = Object.keys(this.FileResult);
            if (AllResultKey.length > 0) {
                for (let i = 0; i < AllResultKey.length; i++) {
                    let ResultKey = AllResultKey[i];
                    let GetResult = this.FileResult[ResultKey];
                    if (GetResult != undefined) {
                        let AllKey = Object.keys(GetResult);
                        if (AllKey.length > 0) {
                            for (let j = 0; i < AllKey.length; j++) {
                                let GetKey = AllKey[j];
                                let GetFileArray = GetResult[GetKey];
                                if (GetFileArray != undefined && GetFileArray.length > 0) {
                                    return true;
                                }
                            }
                        }

                    }
                }
            }
        }
        return false;
    }

    // #endregion

    // #region RCS Function

    RCS_GetResult(Key, FindResult, IsNullCreate = true, DefaultValue = undefined) {
        if (Key.includes('.')) {
            let FirstSplit = Key.split('.')[0];
            let ReplaceKey = Key.replace(`${FirstSplit}.`, '');
            if (FindResult[FirstSplit] == undefined) {
                if (IsNullCreate)
                    FindResult[FirstSplit] = {};
                else
                    return undefined;
            }
            return this.RCS_GetResult(ReplaceKey, FindResult[FirstSplit], IsNullCreate, DefaultValue);
        } else {
            if (FindResult[Key] == undefined) {
                if (IsNullCreate) {
                    let SetValue = DefaultValue != undefined ? DefaultValue : {};
                    FindResult[Key] = SetValue;
                }
            }
            return FindResult[Key];
        }
    }

    RCS_UpdateResult(Key, UpdateValue, FindResult, IsReplace = true) {

        if (Key.includes('.')) {
            let FirstSplit = Key.split('.')[0];
            let ReplaceKey = Key.replace(`${FirstSplit}.`, '');
            if (FindResult[FirstSplit] == undefined) {
                FindResult[FirstSplit] = {};
            }
            this.RCS_UpdateResult(ReplaceKey, UpdateValue, FindResult[FirstSplit], IsReplace);
        } else {
            if (IsReplace || typeof UpdateValue != 'object')
                FindResult[Key] = UpdateValue;
            else
                $.extend(FindResult[Key], UpdateValue);
        }
    }

    RCS_CreateResult(Key, FindResult) {
        let GetResult = this.RCS_GetResult(Key, FindResult, true);
        return GetResult;
    }

    // #endregion
}

var DefaultData;
function Init(_DefaultData) {
    DefaultData = JSON.parse(_DefaultData);
};