import "./App.css";
import { bitable, ViewType, IGridView } from "@lark-base-open/js-sdk";
import { Button, Toast, Space } from "@douyinfe/semi-ui";
import { BaseFormApi } from "@douyinfe/semi-foundation/lib/es/form/interface";
import dayjs from "dayjs";
import { useState, useEffect, useRef, useCallback } from "react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const toastInfo = (content: string) => {
  Toast.info({
    content,
    duration: 3,
    theme: "light",
  });
};

const ButtonLoadingAtom = atom(false);
const FapiaoWidthAtom = atom(211);
const CheckedIdListAtom = atom<string[]>([]);
const DataListAtom = atom<any[]>([]);

let fieldIdList = [
  { value: undefined, name: "姓名" },
  { value: undefined, name: "出入库" },
  { value: undefined, name: "车牌号" },
  { value: undefined, name: "种类" },
  { value: undefined, name: "小分类" },
  { value: undefined, name: "收购单价" },
  { value: undefined, name: "毛重(公斤)" },
  { value: undefined, name: "皮重(公斤)" },
  { value: undefined, name: "净重(公斤)" },
  { value: undefined, name: "收购水分" },
  { value: undefined, name: "去杂" },
  { value: undefined, name: "总金额" },
  { value: undefined, name: "备注" },
  { value: undefined, name: "创建时间" },
];

export default function App() {
  // const [activeDataObj, setActiveDataObj] = useState<Selection>();
  const [ButtonLoading, setLoading] = useAtom(ButtonLoadingAtom);
  const [dataList, setData] = useAtom(DataListAtom);

  const getCheckedList = useCallback(async () => {
    const table = await bitable.base.getActiveTable();
    const view = await table.getActiveView();
    const type = await view.getType();
    if (type !== ViewType.Grid) return;
    const checkedIdList = await (view as IGridView).getSelectedRecordIdList();
    let fieldList = await Promise.all(
      fieldIdList.map((field) => {
        return table.getFieldByName(field.name);
      })
    );

    let cellValueList = await Promise.all(
      checkedIdList.map((recordId) => {
        return Promise.all(
          fieldList.map((field) => {
            return table.getCellValue(field.id, recordId);
          })
        );
      })
    );

    let result = checkedIdList.map((id, idx) => {
      return {
        id,
        value: cellValueList[idx],
      };
    });
    setData(result);
    console.log(result);
  }, []);
  // useEffect(() => {}, []);
  const [fapiaoWidth, changeWidth] = useAtom(FapiaoWidthAtom);
  const widthStyle = {
    width: `${fapiaoWidth}mm`,
  };
  return (
    <main className="main">
      <Space>
        <Button
          theme="solid"
          onClick={getCheckedList}
          type="primary"
          loading={ButtonLoading}
        >
          获取选中的条目
        </Button>
        <Button
          theme="solid"
          onClick={() => {
            const pdfFile = new jsPDF({
              orientation: "landscape",
              unit: "mm",
              format: [fapiaoWidth, 139.5],
            });
            const imageList: Promise<string>[] = [];
            document.querySelectorAll(".item").forEach((item, idx) => {
              imageList.push(
                html2canvas(item as HTMLElement, {
                  scale: window.devicePixelRatio * 3,
                }).then((canvas) => canvas.toDataURL("image/jpeg", 1.0))
              );
            });

            Promise.all(imageList).then((dataUrlList) => {
              dataUrlList.forEach((dataUrl, idx) => {
                idx !== 0 && pdfFile.addPage([fapiaoWidth, 139.5], "landscape");
                pdfFile.addImage(dataUrl, "JPEG", 0, 0, fapiaoWidth, 139.5);
              });
              const url = pdfFile.output("bloburl");
              // pdfFile.save();
              window.open(url);
            });
          }}
          type="primary"
        >
          打印
        </Button>
      </Space>
      <div
        className="pr-background"
        style={{
          minHeight: 800,
          backgroundColor: "#ededed",
          marginTop: 10,
          padding: 20,
          overflow: "scroll",
        }}
      >
        <div className="maoyuanfapiao" style={widthStyle}>
          {dataList.map((item) => (
            <section className="item-wrapper" key={item.id} style={widthStyle}>
              <div className="item">
                <h1 className="title">寿县茂源粮食种植专业合作社</h1>
                <div className="time">
                  <Space>
                    <span>打印时间:</span>
                    <span>{dayjs().format("YYYY-MM-DD HH:mm")}</span>
                  </Space>
                  <Space>
                    <span>入库时间:</span>
                    <span>
                      {dayjs(item?.value?.[13]).format("YYYY-MM-DD HH:mm")}
                    </span>
                  </Space>
                </div>

                <div className="content">
                  <div className="left">
                    <div className="col">
                      <span>姓名：</span>
                      <span>{item?.value?.[0]?.text}</span>
                    </div>
                    <div className="col">
                      <span>出入库：</span>
                      <span>{item?.value?.[1]?.text}</span>
                    </div>
                    <div className="col">
                      <span>车牌号：</span>
                      <span>{item?.value?.[2]?.text}</span>
                    </div>
                    <div className="col">
                      <span>种类：</span>
                      <span>{item?.value?.[3]?.text}</span>
                    </div>
                    <div className="col">
                      <span>小分类：</span>
                      <span>{item?.value?.[4]?.text}</span>
                    </div>
                    <div className="col">
                      <span>收购单价：</span>
                      <span>{item?.value?.[5]}</span>
                    </div>
                  </div>
                  <div className="right">
                    <div className="col">
                      <span>毛重：</span>
                      <span>{item?.value?.[6]}</span>
                    </div>
                    <div className="col">
                      <span>皮重：</span>
                      <span>{item?.value?.[7]}</span>
                    </div>
                    <div className="col">
                      <span>净重：</span>
                      <span>{item?.value?.[8]}</span>
                    </div>
                    <div className="col">
                      <span>水分：</span>
                      <span>{item?.value?.[9]}</span>
                    </div>
                    <div className="col">
                      <span>是否去杂：</span>
                      <span>{item?.value?.[10] ? "是" : "否"}</span>
                    </div>
                    <div className="col">
                      <span>总金额：</span>
                      <span>{item?.value?.[11]}</span>
                    </div>
                  </div>
                </div>
                <div className="tips">
                  <span>备注：</span>
                  <span>{item?.value?.[12]?.[0]?.text}</span>
                </div>
                <div className="tel">
                  <Space>
                    <span>联系方式：</span>
                    <span>新店 181 7507 6255；安丰 137 5795 1236;</span>
                  </Space>
                </div>
                <div className="tel">
                  <Space>
                    <span>抖音：78225646178</span>
                  </Space>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
