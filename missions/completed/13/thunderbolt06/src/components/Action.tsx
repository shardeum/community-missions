import React from 'react';

type ActionProps = {
  action: string,
  onClickAction: () => void
};

type SvgProps = {
  action: string
};

/**
 * Return the SVGs of the Action buttons in the Status Section.
 */
const Svg = (props: SvgProps) => {
  if (props.action === 'undo') {
    return (
      <svg className="status__action-svg" height="512pt" viewBox="0 0 512 512" width="512pt" xmlns="http://www.w3.org/2000/svg"><path d="m154.667969 213.332031h-138.667969c-8.832031 0-16-7.167969-16-16v-138.664062c0-8.832031 7.167969-16 16-16s16 7.167969 16 16v122.664062h122.667969c8.832031 0 16 7.167969 16 16s-7.167969 16-16 16zm0 0" fill="hsl(213, 30%, 59%)"/><path d="m256 512c-68.351562 0-132.628906-26.644531-180.96875-75.03125-6.253906-6.25-6.253906-16.382812 0-22.632812 6.269531-6.273438 16.402344-6.230469 22.632812 0 42.304688 42.347656 98.515626 65.664062 158.335938 65.664062 123.519531 0 224-100.480469 224-224s-100.480469-224-224-224c-105.855469 0-200.257812 71.148438-224.449219 169.171875-2.132812 8.597656-10.75 13.824219-19.371093 11.714844-8.574219-2.132813-13.800782-10.796875-11.710938-19.371094 27.691406-112.148437 135.148438-193.515625 255.53125-193.515625 141.164062 0 256 114.835938 256 256s-114.835938 256-256 256zm0 0" fill="hsl(213, 30%, 59%)"/></svg>
    )
  } else if (props.action === 'erase') {
    return (
      <svg className="status__action-svg" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512.001 512.001"><path d="M505.922,476.567L285.355,256L505.92,35.435c8.106-8.105,8.106-21.248,0-29.354c-8.105-8.106-21.248-8.106-29.354,0L256.001,226.646L35.434,6.081c-8.105-8.106-21.248-8.106-29.354,0c-8.106,8.105-8.106,21.248,0,29.354L226.646,256L6.08,476.567c-8.106,8.106-8.106,21.248,0,29.354c8.105,8.105,21.248,8.106,29.354,0l220.567-220.567l220.567,220.567c8.105,8.105,21.248,8.106,29.354,0S514.028,484.673,505.922,476.567z" fill="hsl(213, 30%, 59%)"/></svg>
    )
  } else if (props.action === 'hint') {
    return (
      <svg className="status__action-svg" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512.001 512.001"><path d="M505.922,476.567L285.355,256L505.92,35.435c8.106-8.105,8.106-21.248,0-29.354c-8.105-8.106-21.248-8.106-29.354,0L256.001,226.646L35.434,6.081c-8.105-8.106-21.248-8.106-29.354,0c-8.106,8.105-8.106,21.248,0,29.354L226.646,256L6.08,476.567c-8.106,8.106-8.106,21.248,0,29.354c8.105,8.105,21.248,8.106,29.354,0l220.567-220.567l220.567,220.567c8.105,8.105,21.248,8.106,29.354,0S514.028,484.673,505.922,476.567z" fill="hsl(213, 30%, 59%)"/></svg>
    )
  } else {
    return null;
  }
}

/**
 * React component for the Action buttons in the Status Section.
 */
export const Action = (props: ActionProps) => {
  return (
    <div className={  props.action === 'undo'
                      ? "status__action-undo"
                      : props.action === 'erase'
                      ? "status__action-erase"
                      : props.action === 'hint'
                      ? "submit"
                      : ""
                    } onClick={props.onClickAction} >
      <Svg action={props.action} />
      <p className="status__action-text">
        {
          props.action === 'undo'
            ? 'Undo'
            : props.action === 'erase'
            ? 'Erase'
            : props.action === 'hint'
            ? 'Submit'
            : ''
        }</p>
    </div>
  )
}
