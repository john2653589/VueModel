/**
 *  VueModel.js v1.7.10
 *  From Rugal Tu
 *  Based on Vue.js v2.6.12、jQuery Library v3.5.1
 * */

class VueModel {
    constructor(_Url, _PageData = {}, _VueOptions = {}, _ElementName = '#content', IsMountedShow = true) {

        this._Vue;
        this._VueOptions = {};

        this.ElementName = _ElementName = this.ToJQueryName(_ElementName);
        this.UrlKeyDic = {};
        this.UrlKeyDic[this.ElementName] = _Url;

        this.SubmitUrl = {};
        this.SubmitCheckColumnKeys = {};
        this.ColumnCHTName = {};

        this.MethodType = 'GET';
        this.VueResult = {
            PageData: _PageData,
            Result: {},
            DomSource: {},
            TempResult: {},
        };
        this.OnSuccess = function (Result) { };
        this.SuccessBackPage = function () { };
        this.OnError = function (Error) { };
        this.OnComplete = function () { };

        this.IsMountedShow = IsMountedShow;

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
    get DomSource() { return this.VueResult.DomSource; }
    get TempResult() { return this.VueResult.TempResult; }
    // #endregion

    // #region Init Native Vue
    /**
     * 初始化 Vue 原生物件設定參數，並將指定 Option Extend 至初始設定
     * @param {any} _VueOptions
     */
    InitOption(_VueOptions) {
        let ElementName = this.ElementName;
        let IsMountedShow = this.IsMountedShow;
        let StaticOptions = {
            mounted() {
                if (IsMountedShow)
                    $(ElementName).show();
            }
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
    // #endregion

    // #region Add Url And Reset VueResult
    /**
     * 加入一個 Url : Key，寫入 UrlKeyDic[Key] 字典，並初始化 VueResult[Key] 存放區
     * @param {any} Key 不得為 undefined
     * @param {any} Url 不得為 undefined
     * @param {any} IsDomSource 可為 undefined
     */
    AddVue(Key, Url, IsDomSource = false) {
        this.UrlKeyDic[Key] = Url;
        this.VueResult[Key] = {};
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
     * @param {any} Key 若為 undefined 則使用 Result 作為 Key 值
     */
    AddV_Model(ObjectId, Key = undefined) {
        Key ??= 'Result';
        ObjectId = this.ToJQueryName(ObjectId);
        $(ObjectId).attr('v-model', Key.replaceAll('_', ''));
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
    AddV_Text(ObjectId, Key = undefined) {
        Key ??= `Result.${ObjectId.replace('_', '')}`;
        ObjectId = this.ToJQueryName(ObjectId);
        $(ObjectId).attr('v-text', Key);
        return this;
    }

    /**
     * 將多個 'v-text' Vue屬性加入至 ObjectId DOM，並指定參數物件 KeyFor
     * @param {any} ObjectIdKey { ObjectId : Key } 不得為 undefined
     * @param {any} KeyFor 若為 undefined 則使用 Result 作為 KeyFor 值
     */
    AddV_TextMult(ObjectIdKey = {}, KeyFor = undefined) {
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

            this.AddV_Text(GetKey, GetVal);
        }
        return this;
    }

    /**
     * 將 'v-on:{EventName}' Vue屬性加入至 ObjectId DOM
     * @param {any} ObjectId 不得為 undefined
     * @param {any} EventName 不得為 undefined
     * @param {any} Key 若為 undefined 則使用 On{ObjectId}{EventName} 作為 Key 值，不需包含 '()'
     * @param {any} Result 若不為 undefined 則放入 VueResult[Key] 存放區
     */
    AddV_On(ObjectId, EventName, Key = undefined, Result = undefined) {

        Key ??= `On${ObjectId}${EventName}`;
        if (!Key.includes('(') && !Key.includes(')'))
            Key = `${Key}()`;

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
     * @param {any} Key 若為 undefined 則使用 Result 作為 Key 值
     */
    AddV_Bind(ObjectId, BindName, Key = undefined) {
        Key ??= 'Result';
        ObjectId = this.ToJQueryName(ObjectId);
        $(ObjectId).attr(`v-bind:${BindName}`, Key);
        return this;
    }

    /**
     * 將 'v-for:{ForKey} in {Key}' Vue屬性加入至 ObjectId DOM
     * @param {any} ObjectId 不得為 undefined
     * @param {any} Key 若為 undefined 則使用 Result 作為 Key 值
     * @param {any} ForKey  若為 undefined 則使用 Item 作為 ForKey 值
     */
    AddV_For(ObjectId, Key = undefined, ForKey = undefined) {
        ObjectId = this.ToJQueryName(ObjectId);
        Key = this.CheckKey(Key);

        if (ForKey == undefined)
            ForKey = 'Item';

        let SetFor = `${ForKey} in ${Key}`;
        $(ObjectId).attr(`v-for`, SetFor);

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
    // #endregion

    // #region Create Or Set Vue Property For DOM Object

    /**
     * <select> : 從 api 建構
     * @param {any} SelectId Dom Id
     * @param {any} Url Api Url
     * @param {any} V_Value 可為 undefined，option value 值
     * @param {any} V_Text 可為 undefined，option 顯示字樣
     * @param {any} V_Model 可為 undefined，綁定選擇欄位
     */
    AddV_Select(SelectId, Url = '', V_Value = undefined, V_Text = undefined, V_Model = undefined) {
        if (Url != undefined && Url != '')
            this.AddVue(SelectId.replaceAll('_', ''), Url);
        this.AddV_SelectBind(SelectId, V_Value, V_Text, V_Model);
        return this;
    }

    /**
     * <select>：從靜態 html 或 指定來源綁定
     * @param {any} SelectId Dom Id
     * @param {any} V_Value 可為 undefined，option value 值
     * @param {any} V_Text 可為 undefined，option 顯示字樣
     * @param {any} V_Model 可為 undefined，綁定選擇欄位
     * @param {any} V_ForKey 指定來源
     */
    AddV_SelectBind(SelectId, V_Value = undefined, V_Text = undefined, V_Model = undefined, V_ForKey = undefined) {

        let V_ForIn = `Item`;
        V_Text ??= `Item`;
        V_Value ??= `Item`;
        V_Model ??= `Result.${V_Value != 'Item' ? V_Value : SelectId.replaceAll('_', '')}`;

        if (!V_Model.includes('.'))
            V_Model = `Result.${V_Model}`;

        V_ForKey ??= `${SelectId}`.replaceAll('#', '').replaceAll('_', '');

        SelectId = this.ToJQueryName(SelectId);
        this.AddV_Model(SelectId, V_Model);

        if (!V_Text.includes('Item') && !V_Text.includes('.'))
            V_Text = `${V_ForIn}.${V_Text}`;

        if (!V_Value.includes('Item') && !V_Value.includes('.'))
            V_Value = `${V_ForIn}.${V_Value}`;

        let OptionObj = $('<option>');
        this.InsertAttrToJQuery(OptionObj, {
            'v-for': `${V_ForIn} in ${V_ForKey}`,
            'v-text': `${V_Text}`,
            ':value': `${V_Value}`
        });

        let SelectObj = $(SelectId);
        SelectObj.append(OptionObj);
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
        InputV_Model ??= `Result.${InputId}`;
        this.AddV_Model(InputId, InputV_Model);
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

    /**
     * <input type="checkbox">：從 Api 建構
     * @param {any} ObjectId Dom Id
     * @param {any} Url Api Url
     * @param {any} ResultKey 可為 undefined，指定結果欄位
     * @param {any} Render 可為 undefined，自訂渲染 html，預設為 <label>@Checkbox　@Display</label>
     * @param {any} CheckboxClass checkbox class 參數
     */
    AddV_Checkbox(ObjectId, Url, ResultKey = undefined, Render = undefined, CheckboxClass = undefined) {

        this.AddVue(ObjectId, Url);
        let ObjectIdReplace = this.ToReplaceObjectId(ObjectId);
        let DisplayValueKey = `Result.${ObjectIdReplace}`;

        this.AddV_CheckboxFrom(ObjectId, DisplayValueKey, ResultKey, Render, CheckboxClass);
        return this;
    }

    /**
     * <input type="checkbox">：從 指定資料來源 建構
     * @param {any} ObjectId Dom Id
     * @param {any} DisplayValueKey 可為 undefined，指定資料來源
     * @param {any} ResultKey 可為 undefined，指定結果欄位
     * @param {any} Render 可為 undefined，自訂渲染 html，預設為 <label>@Checkbox　@Display</label>
     * @param {any} CheckboxClass checkbox class 參數
     */
    AddV_CheckboxFrom(ObjectId, DisplayValueKey = undefined, ResultKey = undefined, Render = undefined, CheckboxClass = undefined) {

        //去除 _
        let ObjectIdReplace = this.ToReplaceObjectId(ObjectId);
        //預設資料來源
        DisplayValueKey = DisplayValueKey ?? `Result.${ObjectIdReplace}`;
        if (!DisplayValueKey.includes('.')) //預設從 Result.{}
            DisplayValueKey = `Result.${DisplayValueKey}`;

        CheckboxClass = CheckboxClass ?? '';
        Render = Render ?? '<label>@Checkbox @Display</label>';

        //預設選擇指定 Result.{Key}
        ResultKey = ResultKey ?? ObjectIdReplace;

        //建立 Dom Source
        if (!this.CreateDomSourceFrom(ObjectId, DisplayValueKey))
            return this;

        let ChangeEventName = `OnCheckboxChange_${ObjectIdReplace}`;
        let CheckedEventName = `OnCheckboxChecked_${ObjectIdReplace}`;
        this.AddEvent_Checkbox(ResultKey, ChangeEventName, CheckedEventName);

        this.AddV_For(ObjectId, `DomSource.${ObjectIdReplace}`);

        let InputAttr = [
            `:id="Item.Value"`,
            `:checked="${CheckedEventName}(Item.Value)"`,
            `v-on:change="${ChangeEventName}(Item.Value)"`,
            `:value="Item.Value"`,
            `class="${CheckboxClass}"`,
        ];

        let InputRender = `<input type="checkbox" ${InputAttr.join(' ')}/>`;

        let CheckboxRender = Render
            .replace('@Checkbox', InputRender)
            .replace('@Display', '{{ Item.Display }}');

        let JObject = $(this.ToJQueryName(ObjectId));
        JObject.append(CheckboxRender);
        return this;
    }

    AddV_CheckboxBind(ObjectId, CheckedValue, ResultKey = undefined) {
        let ObjectIdReplace = ObjectId.replaceAll('_', '');
        ResultKey = ResultKey ?? ObjectIdReplace;

        CheckedValue = CheckedValue ?? $(this.ToJQueryName(ObjectId)).attr('value');
        CheckedValue = CheckedValue ?? ObjectIdReplace;

        this.SetAttr(ObjectId, 'type', 'checkbox');

        let ChangeEventName = `OnCheckboxChange_${ObjectIdReplace}`;
        let CheckedEventName = `OnCheckboxChecked_${ObjectIdReplace}`;
        this.AddEvent_Checkbox(ResultKey, ChangeEventName, CheckedEventName);

        let VBindChecked = `${CheckedEventName}('${ObjectId}', '${CheckedValue}')`;
        this.AddV_Bind(ObjectId, 'checked', VBindChecked);

        let VOnChange = `${ChangeEventName}('${ObjectId}', '${CheckedValue}')`;
        this.AddV_On(ObjectId, 'change', VOnChange);

        return this;
    }

    AddV_Checkbox_Other(ObjectId, ResultKey = undefined, Render = undefined, CheckboxAttr = {}, TextAttr = {}) {

        let ObjectIdReplace = this.ToReplaceObjectId(ObjectId);
        Render = Render ?? `<label>@Checkbox 其它：</label>@Text`;
        ResultKey = ResultKey ?? ObjectIdReplace;

        let CheckboxFuncName = `OnOtherChangeCheckbox_${ObjectIdReplace}`;
        let TextFuncName = `OnOtherChangeText_${ObjectIdReplace}`;

        this.AddEvent_Chechbox_Other(ResultKey, CheckboxFuncName, TextFuncName)

        CheckboxAttr['v-on:change'] = `${CheckboxFuncName}($event)`;
        TextAttr['v-on:change'] = `${TextFuncName}($event)`;

        let CheckboxAttrList = this.ConvertAttrToArray(CheckboxAttr);
        let TextAttrList = this.ConvertAttrToArray(TextAttr);

        let CheckboxRender = `<input type="checkbox" ${CheckboxAttrList.join(' ')}/>`;
        let TextRender = `<input type="text" ${TextAttrList.join(' ')}/>`;

        Render = Render.replaceAll('@Checkbox', CheckboxRender).replaceAll('@Text', TextRender);

        $(this.ToJQueryName(ObjectId)).append(Render);
        return this;
    }

    AddV_CheckboxYesNo(ObjectId, ResultKey = undefined, TrueValue = true, FalseValue = false) {
        let ObjectIdReplace = ObjectId.replaceAll('_', '');
        ResultKey = ResultKey ?? ObjectIdReplace;

        let ChangeEventName = `OnCheckboxChange_${ObjectIdReplace}`;
        let CheckedEventName = `OnCheckboxChecked_${ObjectIdReplace}`;
        this.AddEvent_Checkbox_YesNo(ResultKey, ChangeEventName, CheckedEventName);

        let VBindChecked = `${CheckedEventName}('${ObjectId}', '${TrueValue}', '${FalseValue}')`;
        this.AddV_Bind(ObjectId, 'checked', VBindChecked);

        let VOnChange = `${ChangeEventName}('${ObjectId}', '${TrueValue}', '${FalseValue}')`;

        this.AddV_On(ObjectId, 'change', VOnChange);
        return this;
    }

    AddV_Radio(ObjectId, Url, ResultKey = undefined, Render = undefined, RadioClass = undefined) {
        this.AddVue(ObjectId, Url);
        let ObjectIdReplace = this.ToReplaceObjectId(ObjectId);
        let DisplayValueKey = `Result.${ObjectIdReplace}`;

        this.AddV_RadioFrom(ObjectId, DisplayValueKey, ResultKey, Render, RadioClass);
        return this;
    }

    AddV_RadioFrom(ObjectId, DisplayValueKey, ResultKey = undefined, Render = undefined, RadioClass = undefined) {

        let ObjectIdReplace = ObjectId.replaceAll('_', '');
        DisplayValueKey = DisplayValueKey ?? `Result.${ObjectIdReplace}`;
        if (!DisplayValueKey.includes('.'))
            DisplayValueKey = `Result.${DisplayValueKey}`;

        RadioClass = RadioClass ?? '';
        Render = Render ?? '<label>@Radio @Display</label>';
        ResultKey = ResultKey ?? ObjectIdReplace;

        if (!this.CreateDomSourceFrom(ObjectId, DisplayValueKey))
            return this;

        let ChangeEventName = `OnRadioChange_${ObjectIdReplace}`;
        let CheckedEventName = `OnRadioChecked_${ObjectIdReplace}`;
        this.AddEvent_Radio(ResultKey, ChangeEventName, CheckedEventName);

        this.AddV_For(ObjectId, `DomSource.${ObjectIdReplace}`);

        let InputAttr = [
            `:id="Item.Value"`,
            `:checked="${CheckedEventName}(Item.Value)"`,
            `v-on:change="${ChangeEventName}(Item.Value)"`,
            `:value="Item.Value"`,
            `class="${RadioClass}"`,
            `name="${ObjectIdReplace}"`,
        ];

        let InputRender = `<input type="radio" ${InputAttr.join(' ')}/>`;

        let CheckboxRender = Render
            .replace('@Radio', InputRender)
            .replace('@Display', '{{ Item.Display }}');

        let JObject = $(this.ToJQueryName(ObjectId));
        JObject.append(CheckboxRender);
        return this;
    }

    AddV_RadioBind(ObjectId, CheckedValue, ResultKey = undefined) {
        let ObjectIdReplace = ObjectId.replaceAll('_', '');
        ResultKey = ResultKey ?? ObjectIdReplace;

        CheckedValue = CheckedValue ?? $(this.ToJQueryName(ObjectId)).attr('value');
        CheckedValue = CheckedValue ?? ObjectIdReplace;

        this.SetAttr(ObjectId, 'type', 'radio');

        let ChangeEventName = `OnRadioChange_${ObjectIdReplace}`;
        let CheckedEventName = `OnRadioChecked_${ObjectIdReplace}`;
        this.AddEvent_Radio(ResultKey, ChangeEventName, CheckedEventName);

        let VBindChecked = `${CheckedEventName}('${ObjectId}', '${CheckedValue}')`;
        this.AddV_Bind(ObjectId, 'checked', VBindChecked);

        let VOnChange = `${ChangeEventName}('${ObjectId}', '${CheckedValue}')`;
        this.AddV_On(ObjectId, 'change', VOnChange);

        return this;
    }

    AddV_Radio_Other(ObjectId, ResultKey = undefined, Render = undefined, CheckboxAttr = {}, TextAttr = {}) {

        let ObjectIdReplace = this.ToReplaceObjectId(ObjectId);
        Render = Render ?? `<label>@Checkbox 其它：</label>@Text`;
        ResultKey = ResultKey ?? ObjectIdReplace;

        let CheckboxFuncName = `OnOtherChangeRadio_${ObjectIdReplace}`;
        let TextFuncName = `OnOtherChangeText_${ObjectIdReplace}`;

        this.AddEvent_Chechbox_Other(ResultKey, CheckboxFuncName, TextFuncName)

        CheckboxAttr['v-on:change'] = `${CheckboxFuncName}($event)`;
        TextAttr['v-on:change'] = `${TextFuncName}($event)`;

        let CheckboxAttrList = this.ConvertAttrToArray(CheckboxAttr);
        let TextAttrList = this.ConvertAttrToArray(TextAttr);

        let CheckboxRender = `<input type="radio" ${CheckboxAttrList.join(' ')}/>`;
        let TextRender = `<input type="text" ${TextAttrList.join(' ')}/>`;

        Render = Render.replaceAll('@Checkbox', CheckboxRender).replaceAll('@Text', TextRender);

        $(this.ToJQueryName(ObjectId)).append(Render);
        return this;
    }
    // #endregion

    // #region Add Event For Checkbox
    /**
     * 加入 {FuncName}() 事件至 VueResult 存放區，需於 Html 設定 v-on:change={FuncName}({Id}) 事件綁定，當 Checkbox 選擇變換的時候，將變換 Column 加入/移除 VueResult.Result.{Key} 存放區，使用 'AddFunction()'
     * @param {any} Key 指定 VueResult.Result 存放區，不得為 undefined
     * @param {any} FuncName 不得為 undefined，需自行綁訂於 Html v-on:change
     */
    AddEvent_Checkbox_Change(Key, FuncName) {
        FuncName = FuncName.replaceAll('(', '').replaceAll(')', '');
        this.AddFunction(FuncName, (ObjectId, TrueValue) => {
            let ResultColumn = this.Result[Key];

            ObjectId = ObjectId ?? TrueValue;
            TrueValue = TrueValue ?? ObjectId;

            let FindIdx = ResultColumn.indexOf(TrueValue);
            let JObject = $(this.ToJQueryName(ObjectId));
            //檢核是否為 checked 來決定加入或移除
            let IsChecked = JObject.prop('checked');

            if (IsChecked && FindIdx == -1)
                ResultColumn.push(TrueValue);
            else if (FindIdx > -1)
                ResultColumn.splice(FindIdx, 1);
        });
        return this;
    }
    /**
     * 加入 {FuncName}() 事件至 VueResult 存放區，需於 Html 設定 v-bind:checked={FuncName}({Id}) 事件綁定，當該被加入至 VueResult.Result[Key] 檢核存放區時，通知該選項 DOM checked 屬性設為 true
     * @param {any} Key 指定 VueResult.Result 存放區，不得為 undefined
     * @param {any} FuncName 不得為 undefined，需自行綁訂於 Html v-bind:checked
     */
    AddEvent_Checkbox_Checked(Key, FuncName) {
        FuncName = FuncName.replaceAll('(', '').replaceAll(')', '');
        this.AddFunction(FuncName, (ObjectId, TrueValue) => {

            ObjectId = ObjectId ?? TrueValue;
            TrueValue = TrueValue ?? ObjectId;
            //初始化 Array
            if (!Array.isArray(this.Result[Key]))
                this.Result[Key] = [];

            return this.Result[Key].indexOf(TrueValue) > -1;
        });
        return this;
    }
    /**
     * 加入 {ChangeEventName}()、{CheckedFuncName}() 事件，需於 Html 設定 v-on:change={ChangeEventName}() 及 v-bind:checked={CheckedEvnetName}()，使用 'AddEvent_Checkbox_Change()'、'AddEvent_Checkbox_Checked()'
     * @param {any} Key 指定 VueResult.Result 存放區，不得為 undefined
     * @param {any} ChangeFuncName 不得為 undefined，需自行綁訂於 Html v-on:change
     * @param {any} CheckedFuncName 不得為 undefined，需自行綁訂於 Html v-bind:checked
     */
    AddEvent_Checkbox(Key, ChangeFuncName, CheckedFuncName) {
        this.AddEvent_Checkbox_Change(Key, ChangeFuncName);
        this.AddEvent_Checkbox_Checked(Key, CheckedFuncName);
        return this;
    }



    AddEvent_Checkbox_Change_YesNo(Key, FuncName) {
        FuncName = FuncName.replaceAll('(', '').replaceAll(')', '');
        this.AddFunction(FuncName, (ObjectId, TrueValue, FalseValue) => {
            let JObject = $(this.ToJQueryName(ObjectId));
            let IsChecked = JObject.prop('checked');
            this.Result[Key] = IsChecked ? TrueValue : FalseValue;
        });
        return this;
    }
    AddEvent_Checkbox_Checked_YesNo(Key, FuncName) {
        FuncName = FuncName.replaceAll('(', '').replaceAll(')', '');
        this.AddFunction(FuncName, (ObjectId, TrueValue, FalseValue) => {
            this.Result[Key] = this.Result[Key] ?? false;
            let RetChecked = this.Result[Key];
            return RetChecked;
        });
        return this;
    }
    AddEvent_Checkbox_YesNo(Key, ChangeFuncName, CheckedFuncName) {
        this.AddEvent_Checkbox_Change_YesNo(Key, ChangeFuncName);
        this.AddEvent_Checkbox_Checked_YesNo(Key, CheckedFuncName);
        return this;
    }

    AddEvent_Chechbox_Other_Checkbox(Key, FuncName) {
        FuncName = FuncName.replaceAll('(', '').replaceAll(')', '');
        this.AddFunction(FuncName, (DomObject) => {

            let ResultArray = this.Result[Key];
            if (ResultArray == undefined) {
                this.Result[Key] = [];
                ResultArray = this.Result[Key];
            }

            let CheckedKey = `IsChecked_${Key}`;
            let TrueValue = this.TempResult[Key];

            let JObject = $(DomObject.target);
            let IsChecked = JObject.prop('checked');
            if (IsChecked) {
                this.TempResult[CheckedKey] = true;
                if (TrueValue != undefined && TrueValue != null && TrueValue != '')
                    ResultArray.push(TrueValue);
            } else {
                this.TempResult[CheckedKey] = false;
                let FindIdx = ResultArray.indexOf(TrueValue);
                ResultArray.splice(FindIdx, 1);
            }
        });
        return this;
    }
    AddEvent_Chechbox_Other_Text(Key, FuncName) {
        FuncName = FuncName.replaceAll('(', '').replaceAll(')', '');
        this.AddFunction(FuncName, (DomObject) => {

            let CheckedKey = `IsChecked_${Key}`;
            let IsChecked = this.TempResult[CheckedKey];

            let ResultArray = this.Result[Key];
            if (ResultArray == undefined) {
                this.Result[Key] = [];
                ResultArray = this.Result[Key];
            }

            let JObject = $(DomObject.target);
            let NewTrueValue = JObject.val();
            let OrgValue = this.TempResult[Key];
            let FindIdx = ResultArray.indexOf(OrgValue);
            if (IsChecked) {
                if (FindIdx >= 0)
                    ResultArray.splice(FindIdx, 1);
                if (NewTrueValue != undefined && NewTrueValue != null && NewTrueValue != '')
                    ResultArray.push(NewTrueValue);
            }
            this.TempResult[Key] = NewTrueValue;
        });
        return this;
    }
    AddEvent_Chechbox_Other(Key, CheckboxFuncName, TextFuncName) {
        this.AddEvent_Chechbox_Other_Checkbox(Key, CheckboxFuncName);
        this.AddEvent_Chechbox_Other_Text(Key, TextFuncName);
        return this;
    }
    // #endregion

    // #region Add Event For Radio
    AddEvent_Radio_Change(Key, FuncName) {
        FuncName = FuncName.replaceAll('(', '').replaceAll(')', '');
        this.AddFunction(FuncName, (ObjectId, TrueValue) => {
            ObjectId = ObjectId ?? TrueValue;
            TrueValue = TrueValue ?? ObjectId;

            let JObject = $(this.ToJQueryName(ObjectId));
            let IsChecked = JObject.prop('checked');

            if (IsChecked)
                this.Result[Key] = TrueValue;
        });
        return this;
    }
    AddEvent_Radio_Checked(Key, FuncName) {
        FuncName = FuncName.replaceAll('(', '').replaceAll(')', '');
        this.AddFunction(FuncName, (ObjectId, TrueValue) => {
            ObjectId = ObjectId ?? TrueValue;
            TrueValue = TrueValue ?? ObjectId;
            return this.Result[Key] == TrueValue;
        });
        return this;
    }
    AddEvent_Radio(Key, ChangeFuncName, CheckedFuncName) {
        this.AddEvent_Radio_Change(Key, ChangeFuncName);
        this.AddEvent_Radio_Checked(Key, CheckedFuncName);
        return this;
    }
    AddEvent_Radio_Other(Key, RadioFuncName, TextFuncName) {

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

        Key ??= this.ElementName;
        Key = Key.replaceAll('_', '');

        let Caller = this;
        let SuccessCallback = this.AjaxSuccess;
        let ErrorCallback = this.AjaxError;
        let CompleteCallback = this.AjaxComplete;
        let SendType = this.MethodType;

        let SendUrl = this.GetUrl(Key, SendData, SendType);

        if (typeof SendData === 'object' && Object.keys(SendData).length > 0)
            SendData = JSON.stringify(SendData);

        this.AjaxOptions = {
            type: SendType,
            url: SendUrl,
            data: SendData,
            dataType: 'JSON',
            contentType: 'application/json;charset=utf-8',
            success: function (Result) {
                SuccessCallback.call(Caller, Key, Result);
                OnSuccess?.call(Caller, Result);
            },
            error: function (Error) {
                ErrorCallback.call(Caller, Error);
                OnError?.call(Caller, Error);
            },
            complete: function () {
                CompleteCallback.call(Caller);
                OnComplate?.call(Caller);
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
    Submit(Key, MethodType = undefined, SendParam = undefined, _OnSuccess = undefined, _OnError = undefined, _OnComplate = undefined) {

        let SuccessBackPage = this.SuccessBackPage;
        let SendData, OnSuccess, OnError, OnComplate, SendUrl;
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

        if (SendParam != undefined)
            SendData = SendParam;

        OnSuccess = _OnSuccess ?? Param.OnSuccess;
        OnError = _OnError ?? Param.OnError;
        OnComplate = _OnComplate ?? Param.OnComplate;

        let CheckModel = this.CheckSubmitModel(Key, SendData);
        if (!CheckModel.Check) {
            if (this.OnCheckFalse != undefined)
                this.OnCheckFalse(CheckModel.FalseColumn);

            return this;
        }

        let JsonModel = JSON.stringify(SendData);
        let SubmitOptions = {
            type: MethodType,
            url: SendUrl,
            data: JsonModel,
            dataType: 'JSON',
            contentType: 'application/json;charset=utf-8',
            success: function (Result) {
                OnSuccess?.call(Caller, Result);
                SuccessBackPage?.call(Caller);
            },
            error: function (Error) {
                OnError?.call(Caller, Error);
                alert('Request 錯誤');
            },
            complete: function () {
                OnComplate?.call(Caller);
            },
        };
        $.ajax(SubmitOptions);
        return this;
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
        var IsDomSource = this.IsDomSource(Key);
        if (IsDomSource) {
            this.UpdateDomSource(Key, Result);
        }
        else {
            this.UpdateVueModel(Result, Key);
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
    UpdateVueModel(Result, Key = undefined) {
        Key = this.CheckKey(Key);
        let SetResult = (Key == this.ElementName) ? 'Result' : Key;
        if (this.IsObject(Result)) {
            this.VueResult[SetResult] = Result;
        }
        else if (this.IsString(Result) && this.IsJson(Result)) {
            this.VueResult[SetResult] = JSON.parse(Result);
        }
        else
            this.VueResult[SetResult] = Result;
        return this;
    }

    /**
     * 將多個 KeyResult { Key : Result } 更新至 VueResult[Key] 存放區，推薦使用同名屬性執行，使用 'UpdateVueModel()'
     * @param {any} KeyResult 接受 { Result }，同 'Result' : Result
     * 若 Key 值為 'default'，則使用 ElementName 作為 Key 值
     */
    UpdateVueModelMult(KeyResult = {}) {

        let ObjectKeys = Object.keys(KeyResult);
        for (let Idx in ObjectKeys) {
            let GetKey = ObjectKeys[Idx];
            let GetResult = KeyResult[GetKey];
            if (GetKey.toLowerCase().includes('default'))
                GetKey = undefined;
            this.UpdateVueModel(GetResult, GetKey);
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

        for (let Key in CheckColumns) {
            let Val = CheckColumns[Key];
            if (Model[Key] == undefined || Model[Key] == '') {
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

    /**
     * *預設內部 Function
     * 從 AjaxUrl 字典中取得 Url，並依照 MethodType : 'GET'/'POST' 判斷是否將 SendData 帶入至網址
     * @param {any} Key 不得為 undefined
     * @param {any} SendData 不得為 undefined
     * @param {any} MethodType 不得為 undefined
     */
    GetUrl(Key, SendData, MethodType) {
        let UpperType = MethodType.toUpperCase();
        let SendUrl = this.UrlKeyDic[Key];
        if (UpperType == 'GET') {
            if (typeof SendData === 'object') {
                let Params = [];
                let AllKeys = Object.keys(SendData);
                for (let KeyIdx in AllKeys) {
                    let Key = AllKeys[KeyIdx];
                    let Val = SendData[Key];
                    Params.push(`${Key}=${Val}`);
                }
                let UrlParam = Params.join('&');
                SendUrl = `${SendUrl}?${UrlParam}`;
            }
            else if (typeof SendData === 'string') {
                SendUrl = `${SendUrl}?${SendData}`;
            }
        }
        return SendUrl;
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
    ToJQueryName(ObjectId) { return ObjectId.includes('#') ? ObjectId : `#${ObjectId}`; }

    ToReplaceObjectId(ObjectId) {
        let Ret = ObjectId.replaceAll('_', '').replaceAll('#', '');
        return Ret;
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

    // #region Process DomSource
    CreateDomSourceFrom(ObjectId, DisplayValueKey) {

        let ObjectIdReplace = this.ToReplaceObjectId(ObjectId);

        let GetSource = this.VueResult;
        let DisplayArray = DisplayValueKey.split('.');
        for (let Idx in DisplayArray) {
            let Key = DisplayArray[Idx];
            GetSource = GetSource[Key];
        }
        let SetDomSource = this.ConvertDomSource(GetSource);
        if (SetDomSource == undefined)
            return false;

        this.DomSource[ObjectIdReplace] = SetDomSource;
        return true;
    }

    UpdateDomSource(Key, Source) {
        let GetSource = this.ConvertDomSource(Source);
        if (GetSource == undefined)
            return false;

        let ReplaceKey = this.ToReplaceObjectId(Key);
        this.DomSource[ReplaceKey] = GetSource;
        return true;
    }

    ConvertDomSource(Source) {
        let ReturnSource = [];
        if (Source == undefined)
            Source = {};

        if (typeof Source === "object") {
            if (Array.isArray(Source)) {
                if (Array.isArray(Source[0])) {
                    for (let Idx in Source[0]) {
                        let Display = Source[0][Idx];
                        let Value = Source[1][Idx];
                        ReturnSource.push({
                            Display,
                            Value
                        });
                    }
                }
                else if (typeof Source[0] === "object") {
                    for (let Idx in Source) {
                        let Item = Source[Idx];
                        let AllKey = Object.keys(Item);
                        let DisplayKey = AllKey[0];
                        let ValueKey = AllKey[1];
                        ReturnSource.push({
                            Display: Item[DisplayKey],
                            Value: Item[ValueKey]
                        });
                    }
                }
                else if (typeof Source[0] === "string") {
                    for (let Item in Source) {
                        ReturnSource.push({
                            Display: Item,
                            Value: Item,
                        });
                    }
                }
            }
            else {
                let AllKey = Object.keys(Source);
                let First = Source[AllKey[0]];
                let Two = Source[AllKey[1]];
                if (typeof First === "string") {
                    for (let Idx in AllKey) {
                        let Display = AllKey[Idx];
                        let Value = Source[Display];
                        ReturnSource.push({
                            Display,
                            Value,
                        });
                    }
                }
                else if (Array.isArray(First)) {
                    for (let Idx in First) {
                        let Display = First[Idx];
                        let Value = Two[Idx];
                        ReturnSource.push({
                            Display,
                            Value,
                        });
                    }
                }
            }
        }
        else return undefined;
        return ReturnSource;
    }

    IsDomSource(Key) {
        let AllKey = Object.keys(this.DomSource);
        let ReplaceKey = this.ToReplaceObjectId(Key);
        return AllKey.indexOf(ReplaceKey) >= 0;
    }
    // #endregion
}