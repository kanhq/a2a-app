

export type ActionColumnOption = {
  label: string
  value: string
}


export type ActionColumnDefine = {
  label: string
  field: string
  style?: string
  frozen?: boolean
  password?: boolean
  options?: ActionColumnOption[]
  onlyOptions?: boolean

};

export type ActionConfig = {
  label: string
  name: string
  icon?: string
  columns: ActionColumnDefine[]

  serialize?: (data: any, _this?: any) => any
  deserialize?: (data: any, _this?: any) => any

  [key: string]: any
};