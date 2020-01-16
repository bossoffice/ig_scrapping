import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [result, setResult] = useState("");
  const [input, setInput] = useState("");
  const [img, setImg] = useState("");
  const [caption, setCaption] = useState("");
  const [api_Result, setApi_Result] = useState([]);
  const [click, setClick] = useState(false);
  // const [protect, setProtect] = useState(false);

  // smaller but more mothod -> from uint 8 decode to html str
  // useEffect(() => {
  //   let utf8_array = new Uint8Array(result.value);
  //   let decode = new TextDecoder("utf-8").decode(utf8_array);
  //   console.log("effect", decode);
  // }, [result]);

  // let handleSearch = async e => {
  //   e.preventDefault();
  //   if (!input) {
  //     alert("input this url mother fucker");
  //   } else {
  //     fetch("/p/B4OkuTDHbst/")
  //       .then(resp => {
  //         console.log(resp);
  //         return resp.body.getReader().read();
  //       })
  //       .then(res => {
  //         setResult(res);
  //       });
  //   }
  // };

  //bigger but less method used default method to string and simply cut with slice
  // useEffect(() => {
  //   if (result) {
  //     let imgSrc = result.slice(
  //       result.indexOf("og:image") + 19,
  //       result.indexOf('" />', result.indexOf("og:image") + 19)
  //     );
  //     let caption = JSON.parse(
  //       result.slice(
  //         result.indexOf('{"@context"'),
  //         result.indexOf("</script>", result.indexOf('{"@context"'))
  //       )
  //     );
  //     console.log("imgSrc", imgSrc);
  //     console.log("caption", caption);
  //   }
  // }, [result]);

  // let handleSearch = e => {
  //   e.preventDefault();

  //   if (!input) {
  //     alert("input this url mother fucker");
  //   } else {
  //     console.log("click");
  //     fetch("https://www.instagram.com/p/Bw4XUnQAbho/")
  //       .then(resp => {
  //         // console.log(resp);
  //         return resp.text();
  //       })
  //       .then(res => {
  //         setResult(res);
  //       });
  //   }
  // };

  useEffect(() => {
    // setProtect(false);
    setClick(false);
  }, [api_Result]);

  useEffect(() => {
    try {
      if (result) {
        let htmlParser = new DOMParser();
        let htmlDoc = htmlParser.parseFromString(result, "text/html");

        //check ig url that have picture or not if not it mean invalid link ig
        if (!htmlDoc.querySelector("meta[property='og:image']")) {
          throw new Error("instagram url is invalid");
        }
        let imgSrc = htmlDoc
          .querySelector("meta[property='og:image']")
          .getAttribute("content");
        let captionSrc = JSON.parse(
          htmlDoc.querySelector("script[type='application/ld+json']").innerHTML
        );

        async function getImageDetection(imgSrc) {
          try {
            let api_Key = "AIzaSyDIlMt1FZpB4eZIfsDUm2VE5LTYG_wvYvM";
            let getResponse = await fetch(
              `https://vision.googleapis.com/v1/images:annotate?key=${api_Key}`,
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  requests: [
                    {
                      features: [
                        {
                          maxResults: 10,
                          type: "OBJECT_LOCALIZATION"
                        }
                      ],
                      image: {
                        source: {
                          imageUri: imgSrc
                        }
                      }
                    }
                  ]
                })
              }
            );
            let { responses } = await getResponse.json();
            let res_array = await responses[0].localizedObjectAnnotations;

            // set shor element
            setApi_Result(res_array.map(item => item.name));
            setImg(imgSrc);
            setCaption(captionSrc.caption);
          } catch (err) {
            setClick(false);
            console.error("detail : ", err);
          }
        }
        getImageDetection(imgSrc);
      }
    } catch (err) {
      setClick(false);
      console.error(err);
    }
  }, [result]);

  let fetchData = async src => {
    try {
      // fetch is toolong for timeout
      // let raw_resp = await fetch(src);
      // let resp = await raw_resp.text();

      // use axios is auto timeout easier to understand
      let raw_resp = await axios({
        method: "get",
        url: src
      });
      let resp = await raw_resp.data;
      setResult(resp);
    } catch (err) {
      console.error("error when fetching");
      setClick(false);
    }
  };

  useEffect(() => {
    try {
      if (
        input &&
        click &&
        input.match(/https*:\/\/www.instagram.com\/p\/(\w*\b)\//g)
      ) {
        // if (!protect) {
        // setProtect(true);
        fetchData(input);
        // }
      } else if (input && click) {
        setClick(false);
        alert("input instagram url");
      } else if (!input && click) {
        setClick(false);
        alert("input instagram url");
      } else {
      }
    } catch (err) {
      console.error(err);
    } // eslint-disable-next-line
  }, [input, click]);

  return (
    <div className="center">
      <div>{caption && <p>{caption}</p>}</div>
      <div style={{ padding: 50 }}>
        {img && <img src={img} alt={"url"} width={250} height={250} />}
      </div>
      <div>
        <form>
          <label>
            Name :
            <input
              className="padder"
              type="text"
              name="name"
              placeholder="only https://www.instagram.com/p/xxxxxx/"
              onChange={e => setInput(e.target.value)}
            />
          </label>
          {click ? (
            <p>Loading...</p>
          ) : (
            <input
              type="submit"
              value="Submit"
              onClick={() => setClick(true)}
            />
          )}
        </form>
        <p>
          Result from api : {api_Result.length !== 0 && api_Result.toString()}
        </p>
      </div>
    </div>
  );
}

export default App;
