import type {Answers,Question} from '../domain/types';
export interface GameState {screen:'home'|'quiz'|'results';topicId?:string;questions:Question[];answers:Answers;index:number;transition:boolean}
export const initialState:GameState={screen:'home',questions:[],answers:{},index:0,transition:false};
export type GameAction={type:'start';questions:Question[];topicId?:string}|{type:'answer';questionId:string;optionId:string}|{type:'next'}|{type:'previous'}|{type:'unlock'}|{type:'reset'};
export function gameReducer(state:GameState,action:GameAction):GameState{
 switch(action.type){
  case 'start':return {...initialState,screen:'quiz',questions:action.questions,topicId:action.topicId};
  case 'answer':{
   const q=state.questions[state.index];
   if(state.screen!=='quiz'||state.transition||q?.id!==action.questionId||!q.options.some(o=>o.id===action.optionId))return state;
   return {...state,answers:{...state.answers,[q.id]:action.optionId}};
  }
  case 'next':{
   const q=state.questions[state.index];
   if(state.screen!=='quiz'||state.transition||!q?.options.some(o=>o.id===state.answers[q.id]))return state;
   return state.index===9?{...state,screen:'results',transition:true}:{...state,index:state.index+1,transition:true};
  }
  case 'previous':return state.screen==='quiz'&&!state.transition&&state.index>0?{...state,index:state.index-1,transition:true}:state;
  case 'unlock':return {...state,transition:false};
  case 'reset':return {...initialState};
 }
}
